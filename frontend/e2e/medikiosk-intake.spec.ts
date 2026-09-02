import { test, expect } from '@playwright/test';

test.describe('MediKiosk Patient Pre-Consultation E2E Intake Flow', () => {
  test('Complete synthetic patient intake flow from Welcome through Review to Completion', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    page.on('request', req => console.log('REQ:', req.method(), req.url()));
    page.on('response', res => console.log('RES:', res.status(), res.url()));
    
    let questionCallCount = 0;

    // 1. Mock Consultation Creation
    await page.route('**/api/v1/consultations', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          consultation_id: 'e2e-consultation-uuid-001',
          status: 'created',
          pathway: 'triage',
        }),
      });
    });

    // 2. Mock Dynamic Question Sequence
    await page.route('**/api/v1/consultations/e2e-consultation-uuid-001/next-question*', async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      questionCallCount++;
      if (questionCallCount === 1) {
        // First question: Chief Complaint
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            consultation_id: 'e2e-consultation-uuid-001',
            question_key: 'chief_complaint',
            section: 'Chief Complaint',
            clinical_field: 'chief_complaint',
            question_text: 'What brings you here today? Please tell us what problem or symptom you are experiencing.',
            input_type: 'text',
            is_required: true,
            is_complete: false,
            progress_percentage: 10,
          }),
        });
      } else if (questionCallCount === 2) {
        // Second question: Location (after triage classification)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            consultation_id: 'e2e-consultation-uuid-001',
            question_key: 'ap_location',
            section: 'HPI',
            clinical_field: 'location',
            question_text: 'Where exactly is the abdominal pain located?',
            input_type: 'text',
            is_required: true,
            is_complete: false,
            progress_percentage: 25,
          }),
        });
      } else {
        // Third question: Mark questionnaire complete to advance to Review
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            consultation_id: 'e2e-consultation-uuid-001',
            question_key: null,
            section: null,
            clinical_field: null,
            question_text: null,
            is_complete: true,
            progress_percentage: 100,
          }),
        });
      }
    });

    // 3. Mock Answer Submission
    await page.route('**/api/v1/consultations/e2e-consultation-uuid-001/answers*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          message: 'Answer saved and rules evaluated',
        }),
      });
    });

    // 4. Mock Progress
    await page.route('**/api/v1/consultations/e2e-consultation-uuid-001/progress', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          consultation_id: 'e2e-consultation-uuid-001',
          status: 'intake',
          completed_questions: ['chief_complaint', 'ap_location'],
          pending_questions: [],
          red_flags_triggered: 0,
        }),
      });
    });

    // 5. Mock Summary for Review Screen
    await page.route('**/api/v1/consultations/e2e-consultation-uuid-001/summary*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          consultation_id: 'e2e-consultation-uuid-001',
          patient_id: 'synth-patient-001',
          status: 'intake',
          chief_complaint: 'Abdominal Pain',
          answers_by_section: {
            'Chief Complaint': [
              {
                question_key: 'chief_complaint',
                section: 'Chief Complaint',
                clinical_field: 'chief_complaint',
                question_text: 'What brings you here today? Please tell us what problem or symptom you are experiencing.',
                answer_text: 'I have abdominal pain',
                answer_status: 'answered',
                source: 'patient_reported',
                verification_status: 'unverified',
              },
            ],
            HPI: [
              {
                question_key: 'ap_location',
                section: 'HPI',
                clinical_field: 'location',
                question_text: 'Where exactly is the abdominal pain located?',
                answer_text: 'Right lower abdomen',
                answer_status: 'answered',
                source: 'patient_reported',
                verification_status: 'unverified',
              },
            ],
          },
          red_flags_count: 0,
        }),
      });
    });

    // 6. Mock Complete Endpoint
    await page.route('**/api/v1/consultations/e2e-consultation-uuid-001/complete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          message: 'Consultation marked as completed',
        }),
      });
    });

    // Step 1: Open MediKiosk Welcome Screen
    await page.goto('/');
    await expect(page.locator('h1', { hasText: 'MediKiosk' })).toBeVisible();
    await expect(page.getByRole('main').getByText('Pre-Consultation Clinical Intake Kiosk')).toBeVisible();

    // Step 2: Language Selection
    await page.getByRole('button', { name: /Touch Here to Start/i }).click();
    await expect(page.getByText('Choose Your Language')).toBeVisible();
    await page.getByRole('main').getByText('English').first().click();
    await page.getByRole('button', { name: /Next Question|Next/i }).click();

    // Step 3: Consent Screen
    await expect(page.getByText('Informed Pre-Consultation Consent')).toBeVisible();
    await expect(page.getByText(/This kiosk does NOT diagnose conditions/i)).toBeVisible();
    await page.getByRole('button', { name: /I Understand and Agree/i }).click();

    // Step 4: Patient Information Form
    await expect(page.getByText('Patient Information')).toBeVisible();
    await page.getByPlaceholder(/Enter your full name/i).fill('Rajesh Kumar (Synthetic)');
    await page.getByPlaceholder(/e.g. 45/i).fill('45');
    await page.getByRole('button', { name: 'Male', exact: true }).click();
    await page.getByRole('button', { name: /Begin Health Questions/i }).click();

    // Step 5: Backend-driven Question 1 (Chief Complaint)
    await expect(page.getByText('What brings you here today?')).toBeVisible();
    const inputCC = page.getByRole('textbox', { name: 'Answer input' });
    await inputCC.fill('I have abdominal pain');
    await page.getByRole('button', { name: /Submit & Next/i }).click();

    // Step 6: Backend-driven Question 2 (Location)
    await expect(page.getByText('Where exactly is the abdominal pain located?')).toBeVisible();
    
    // Step 7: Submit Answer
    const inputLocation = page.getByRole('textbox', { name: 'Answer input' });
    await inputLocation.fill('Right lower abdomen');
    await page.getByRole('button', { name: /Submit & Next/i }).click();

    // Step 8: Review Screen
    await expect(page.getByText('Review Your Health History')).toBeVisible();
    await expect(page.getByText('I have abdominal pain')).toBeVisible();
    await expect(page.getByText('Right lower abdomen')).toBeVisible();
    await expect(page.getByText('Recorded', { exact: true }).first()).toBeVisible();

    // Step 9: Complete Consultation
    await page.getByRole('button', { name: /Confirm & Submit to Doctor/i }).click();

    // Step 10: Completion Screen
    await expect(page.getByText('Health History Recorded Successfully')).toBeVisible();
    await expect(page.getByText(/Your pre-consultation summary is now ready for your physician/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Finish and Return to Home/i })).toBeVisible();

    // Verify absence of autonomous diagnoses or drug recommendations
    await expect(page.getByText(/Prescription:/i)).not.toBeVisible();
    await expect(page.getByText(/Diagnosed with:/i)).not.toBeVisible();
  });
});
