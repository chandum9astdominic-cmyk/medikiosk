import json
import os
import logging
from typing import Optional, Dict, Any, List
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.clinical import Consultation, ClinicalAnswer, Question, QuestionInputType, RedFlag
from app.schemas.clinical import ClinicalPathway, AnswerSubmission, NextQuestionResponse, ConsultationProgress
from app.providers.llm.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class ClinicalEngine:
    def __init__(self, db: AsyncSession, llm_provider: BaseLLMProvider):
        self.db = db
        self.llm_provider = llm_provider
        self.pathways: Dict[str, ClinicalPathway] = {}
        self._load_pathways()

    def _load_pathways(self):
        """Load clinical pathways from JSON configuration."""
        # Hardcoding the path to the pathways directory for now
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        pathways_dir = os.path.join(base_dir, "data", "pathways")
        if not os.path.exists(pathways_dir):
            return
            
        for filename in os.listdir(pathways_dir):
            if filename.endswith(".json"):
                with open(os.path.join(pathways_dir, filename), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    pathway = ClinicalPathway(**data)
                    self.pathways[pathway.pathway_id] = pathway

    async def initialize_session(self, consultation_id: uuid.UUID, pathway_id: str) -> None:
        """Initialize the consultation session state."""
        consultation = await self.db.get(Consultation, consultation_id)
        if not consultation:
            raise ValueError("Consultation not found")
        
        pathway = self.pathways.get(pathway_id)
        if not pathway:
            raise ValueError(f"Pathway {pathway_id} not found")

        # Initialize session state tracking
        session_state = {
            "pathway_id": pathway_id,
            "completed_questions": [],
            "pending_questions": [q.question_key for q in sorted(pathway.questions, key=lambda x: x.display_order)],
            "skipped_questions": []
        }
        
        consultation.session_state = session_state
        consultation.complaint_category = pathway_id
        await self.db.commit()

    async def get_next_question(self, consultation_id: uuid.UUID, language: str = "en") -> NextQuestionResponse:
        """Determine and return the next question."""
        consultation = await self.db.get(Consultation, consultation_id)
        if not consultation or not consultation.session_state:
            raise ValueError("Consultation not initialized")

        session_state = consultation.session_state
        pending = session_state.get("pending_questions", [])
        
        if not pending:
            return NextQuestionResponse(
                consultation_id=consultation_id,
                question_key=None,
                section=None,
                question_text=None,
                is_complete=True,
                progress_percentage=100
            )
            
        next_q_key = pending[0]
        pathway = self.pathways.get(session_state["pathway_id"])
        question = next((q for q in pathway.questions if q.question_key == next_q_key), None)
        
        if not question:
             raise ValueError(f"Question {next_q_key} not found in pathway")

        total = len(session_state.get("completed_questions", [])) + len(pending) + len(session_state.get("skipped_questions", []))
        progress = int((len(session_state.get("completed_questions", [])) / total) * 100) if total > 0 else 0

        text = question.question_text.get(language, question.question_text.get("en", ""))

        return NextQuestionResponse(
            consultation_id=consultation_id,
            question_key=question.question_key,
            section=question.section,
            clinical_field=question.clinical_field,
            question_text=text,
            input_type=question.input_type,
            options=question.options,
            is_required=question.is_required,
            is_complete=False,
            progress_percentage=progress
        )

    async def process_answer(self, consultation_id: uuid.UUID, question_key: str, answer: AnswerSubmission) -> None:
        """Process a natural language answer, extract structure, save, and evaluate rules."""
        consultation = await self.db.get(Consultation, consultation_id)
        if not consultation or not consultation.session_state:
            raise ValueError("Consultation not initialized")

        session_state = consultation.session_state
        if question_key not in session_state.get("pending_questions", []):
            raise ValueError(f"Question {question_key} is not currently pending")

        # 1. LLM Extraction (Safe symptom/fact extraction only)
        extracted = await self.llm_provider.extract_entities(answer.raw_text)
        
        # Determine if answer is missing/unknown/declined/skipped explicitly
        raw_lower = answer.raw_text.lower().strip()
        status = "answered"
        if raw_lower in ["i don't know", "not sure", "unknown", "dont know"]:
            status = "not_known"
        elif raw_lower in ["declined", "prefer not to answer", "i prefer not to answer"]:
            status = "declined"
        elif raw_lower in ["skip", "skipped", "not applicable", "n/a"]:
            status = "skipped"

        # 2. Find Database Question (Create dynamically if doesn't exist to satisfy DB schema, though we drive from JSON)
        result = await self.db.execute(select(Question).where(Question.question_key == question_key))
        db_question = result.scalars().first()
        
        if not db_question:
            pathway = self.pathways.get(session_state["pathway_id"])
            q_config = next((q for q in pathway.questions if q.question_key == question_key), None)
            if q_config:
                db_question = Question(
                    pathway=pathway.pathway_id,
                    section=q_config.section,
                    clinical_field=q_config.clinical_field,
                    question_text=q_config.question_text,
                    question_key=q_config.question_key,
                    input_type=QuestionInputType.text,
                    is_required=q_config.is_required,
                    display_order=q_config.display_order
                )
                self.db.add(db_question)
                await self.db.flush()
            else:
                 raise ValueError("Question not found in pathway config")

        # 3. Store Answer (Mark as unverified so doctor can confirm)
        clinical_answer = ClinicalAnswer(
            consultation_id=consultation.id,
            question_id=db_question.id,
            answer_text=answer.raw_text,
            answer_structured=extracted,
            answer_status=status
        )
        self.db.add(clinical_answer)
        await self.db.flush()

        # 4. Update Session State
        session_state["pending_questions"].remove(question_key)
        if status == "skipped":
            session_state.setdefault("skipped_questions", []).append(question_key)
        else:
            session_state["completed_questions"].append(question_key)
        
        # 5. Evaluate Rules (Deterministic triggers)
        await self._evaluate_rules(consultation, question_key, answer.raw_text, extracted, clinical_answer.id)
        
        consultation.session_state = session_state
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(consultation, "session_state")
        
        await self.db.commit()

    async def _evaluate_rules(self, consultation: Consultation, question_key: str, answer_text: str, extracted: Any, answer_id: uuid.UUID):
        """Evaluate deterministic rules based on the patient's answer."""
        pathway = self.pathways.get(consultation.session_state["pathway_id"])
        if not pathway:
            return

        answer_lower = answer_text.lower()
        
        # Build a lookup dictionary from extracted structure if available
        extracted_dict = {}
        if isinstance(extracted, dict):
            extracted_dict = extracted
        elif isinstance(extracted, list):
            for item in extracted:
                if hasattr(item, "clinical_field") and hasattr(item, "value"):
                    extracted_dict[item.clinical_field] = item.value
                elif isinstance(item, dict) and "clinical_field" in item:
                    extracted_dict[item["clinical_field"]] = item.get("value")
        
        for rule in pathway.rules:
            if rule.trigger_question == question_key:
                triggered = False
                
                # Check raw text
                if rule.condition == "contains" and rule.value.lower() in answer_lower:
                    triggered = True
                
                # Check structured extracted data
                elif rule.condition == "equals_true" and extracted_dict.get(rule.value, False) is True:
                    triggered = True
                
                # Check always
                elif rule.condition == "always":
                    triggered = True
                
                if triggered:
                    if rule.action == "flag_red":
                        flag = RedFlag(
                            consultation_id=consultation.id,
                            rule_id=rule.rule_id,
                            rule_name=rule.action,
                            message=rule.metadata.get("message", "Potential urgent symptom identified."),
                            severity=rule.metadata.get("severity", "high"),
                            triggered_by={
                                "question_key": question_key,
                                "raw_text": answer_text,
                                "source": "patient_answer",
                                "answer_id": str(answer_id)
                            }
                        )
                        self.db.add(flag)
                        logger.warning(f"Red flag triggered for consultation {consultation.id}: {rule.metadata.get('message')}")
                    elif rule.action == "ask_followup":
                        if rule.action_target and rule.action_target not in consultation.session_state["pending_questions"]:
                            consultation.session_state["pending_questions"].insert(0, rule.action_target)
                    elif rule.action == "classify_pathway":
                        # Use the LLM to classify the chief complaint and switch pathway
                        new_pathway_id = await self.llm_provider.classify_complaint(answer_text)
                        
                        # Load new pathway
                        new_pathway = self.pathways.get(new_pathway_id)
                        if new_pathway:
                            consultation.session_state["pathway_id"] = new_pathway_id
                            consultation.session_state["pending_questions"] = [q.question_key for q in new_pathway.questions]
                            logger.info(f"Classified pathway to {new_pathway_id}")

    async def get_progress(self, consultation_id: uuid.UUID) -> ConsultationProgress:
        consultation = await self.db.get(Consultation, consultation_id)
        if not consultation or not consultation.session_state:
            raise ValueError("Consultation not initialized")

        result = await self.db.execute(select(RedFlag).where(RedFlag.consultation_id == consultation_id))
        red_flags = result.scalars().all()

        return ConsultationProgress(
            consultation_id=consultation_id,
            status=consultation.status.name,
            completed_questions=consultation.session_state.get("completed_questions", []),
            pending_questions=consultation.session_state.get("pending_questions", []),
            red_flags_triggered=len(red_flags)
        )

    async def get_summary(self, consultation_id: uuid.UUID, language: str = "en") -> Dict[str, Any]:
        """Fetch consultation review summary grouped by section."""
        consultation = await self.db.get(Consultation, consultation_id)
        if not consultation:
            raise ValueError("Consultation not found")

        # Load answers with questions
        result = await self.db.execute(
            select(ClinicalAnswer, Question)
            .join(Question, ClinicalAnswer.question_id == Question.id)
            .where(ClinicalAnswer.consultation_id == consultation_id)
            .order_by(Question.display_order)
        )
        rows = result.all()

        answers_by_section: Dict[str, list] = {}
        for ans, q in rows:
            section = q.section or "General"
            q_text = q.question_text.get(language, q.question_text.get("en", q.question_key)) if isinstance(q.question_text, dict) else str(q.question_text)
            item = {
                "question_key": q.question_key,
                "section": section,
                "clinical_field": q.clinical_field,
                "question_text": q_text,
                "answer_text": ans.answer_text,
                "answer_status": ans.answer_status,
                "source": ans.source.value if hasattr(ans.source, "value") else str(ans.source),
                "verification_status": ans.verification_status.value if hasattr(ans.verification_status, "value") else str(ans.verification_status)
            }
            answers_by_section.setdefault(section, []).append(item)

        # Count red flags
        rf_result = await self.db.execute(select(RedFlag).where(RedFlag.consultation_id == consultation_id))
        red_flags = rf_result.scalars().all()

        return {
            "consultation_id": str(consultation.id),
            "patient_id": str(consultation.patient_id),
            "status": consultation.status.name if hasattr(consultation.status, "name") else str(consultation.status),
            "chief_complaint": consultation.chief_complaint or consultation.complaint_category or "General Consultation",
            "complaint_category": consultation.complaint_category,
            "answers_by_section": answers_by_section,
            "red_flags_count": len(red_flags)
        }

