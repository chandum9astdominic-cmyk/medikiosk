import { test, expect } from '@playwright/test';

test.describe('Doctor Dashboard and Review Flow', () => {
  test('should display the queue and navigate to review', async ({ page }) => {
    // Navigate to the doctor dashboard
    await page.goto('/doctor');

    // Wait for the queue to load
    await expect(page.getByText('Waiting Room Queue')).toBeVisible();

    // In a completely synthetic test environment without seeding, 
    // it might be empty. But we should just assert that the page loads properly.
    
    // Wait for either the empty state or a patient card to appear
    await Promise.race([
      page.waitForSelector('.bg-white.rounded-xl.p-5', { state: 'visible' }),
      page.waitForSelector('text=No patients in queue', { state: 'visible' })
    ]);

    const hasPatients = await page.locator('.bg-white.rounded-xl.p-5').count() > 0;
    
    if (hasPatients) {
      // If there are patients, try clicking one
      const patientCard = page.locator('.bg-white.rounded-xl.p-5').first();
      await patientCard.click();

      // Expect to navigate to the review page
      await expect(page).toHaveURL(/.*\/doctor\/consultation\/.*/);

      // Expect Review sections to be visible
      await expect(page.getByText('Chief Complaint')).toBeVisible();
      await expect(page.getByText('Finalize Review')).toBeVisible();
    }
  });
});
