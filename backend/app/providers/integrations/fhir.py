from typing import List, Dict, Any
from datetime import datetime, timezone
import uuid

class MockFHIRAdapter:
    """
    Mock adapter for generating FHIR (Fast Healthcare Interoperability Resources).
    Generates a mock FHIR bundle from available structured data.
    """
    
    def _create_patient_resource(self, patient: Any) -> Dict[str, Any]:
        return {
            "resourceType": "Patient",
            "id": str(patient.id),
            "identifier": [
                {
                    "system": "https://healthid.ndhm.gov.in",
                    "value": patient.abha_id if patient.abha_id else "UNLINKED"
                }
            ],
            "name": [
                {"text": patient.name}
            ],
            "gender": patient.gender.lower() if patient.gender else "unknown",
            "birthDate": str(patient.date_of_birth) if patient.date_of_birth else None
        }
        
    def _create_encounter_resource(self, consultation: Any, patient_id: str) -> Dict[str, Any]:
        return {
            "resourceType": "Encounter",
            "id": str(consultation.id),
            "status": "finished" if consultation.status.name == "completed" else "in-progress",
            "class": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "AMB",
                "display": "ambulatory"
            },
            "subject": {
                "reference": f"Patient/{patient_id}"
            },
            "period": {
                "start": consultation.created_at.isoformat() if consultation.created_at else None
            },
            "reasonCode": [
                {
                    "text": consultation.chief_complaint or consultation.complaint_category or "Pre-Consultation"
                }
            ]
        }

    def _create_observation_resource(self, answer: Any, patient_id: str, encounter_id: str) -> Dict[str, Any]:
        """Maps patient reported answers to Observation resources."""
        return {
            "resourceType": "Observation",
            "id": str(answer.id),
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "survey",
                            "display": "Survey"
                        }
                    ]
                }
            ],
            "code": {
                "text": answer.question_key
            },
            "subject": {
                "reference": f"Patient/{patient_id}"
            },
            "encounter": {
                "reference": f"Encounter/{encounter_id}"
            },
            "valueString": answer.answer_text,
            "issued": answer.created_at.isoformat() if answer.created_at else None
        }

    def _create_condition_resource(self, entity: Any, patient_id: str, encounter_id: str) -> Dict[str, Any]:
        """
        Maps explicitly extracted Conditions to FHIR.
        IMPORTANT: Only explicitly verified entities from documents or patient history
        are mapped. No LLM diagnostic inference is allowed here.
        """
        return {
            "resourceType": "Condition",
            "id": str(entity.id),
            "clinicalStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code": "active"
                    }
                ]
            },
            "verificationStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                        "code": "confirmed" if entity.verification_status.name == "verified" else "unconfirmed"
                    }
                ]
            },
            "code": {
                "text": entity.normalized_value or entity.raw_value
            },
            "subject": {
                "reference": f"Patient/{patient_id}"
            },
            "encounter": {
                "reference": f"Encounter/{encounter_id}"
            }
        }

    def generate_bundle(self, patient: Any, consultation: Any, answers: List[Any], documents: List[Any], entities: List[Any]) -> Dict[str, Any]:
        """
        Builds a FHIR Bundle.
        """
        entries = []
        
        # Patient
        patient_resource = self._create_patient_resource(patient)
        entries.append({"resource": patient_resource})
        
        # Encounter
        encounter_resource = self._create_encounter_resource(consultation, str(patient.id))
        entries.append({"resource": encounter_resource})
        
        # Observations (from clinical answers)
        for answer in answers:
            if answer.answer_status == "answered":
                entries.append({"resource": self._create_observation_resource(answer, str(patient.id), str(consultation.id))})
                
        # Conditions (from explicitly verified entities)
        for entity in entities:
            if entity.entity_type == "condition":
                entries.append({"resource": self._create_condition_resource(entity, str(patient.id), str(consultation.id))})
                
        # Medications (similar to condition)
        for entity in entities:
            if entity.entity_type == "medication":
                med_resource = {
                    "resourceType": "MedicationStatement",
                    "id": str(entity.id),
                    "status": "active",
                    "medicationCodeableConcept": {
                        "text": entity.normalized_value or entity.raw_value
                    },
                    "subject": {
                        "reference": f"Patient/{str(patient.id)}"
                    }
                }
                entries.append({"resource": med_resource})

        return {
            "resourceType": "Bundle",
            "id": str(uuid.uuid4()),
            "type": "collection",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "meta": {
                "lastUpdated": datetime.now(timezone.utc).isoformat(),
                "tag": [
                    {
                        "display": "FHIR DEMO / MOCK"
                    }
                ]
            },
            "entry": entries
        }
