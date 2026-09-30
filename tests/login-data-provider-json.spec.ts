import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
const dataFilePath = path.join(__dirname, '../test-data/login.json');
const loginData: Array<{ username: string; password: string; isValid: boolean }> = JSON.parse(
  fs.readFileSync(dataFilePath, 'utf-8')
);

test.describe('Login Data-Driven Tests from JSON', () => {
  for (const record of loginData) {
    test(`Login test for user: ${record.username}`, async ({ page }) => {
      await page.goto('customer@practicesoftwaretesting.com');
      await page.fill('#username', record.username);
      await page.fill('#password', record.password);
      await page.click('button[type="submit"]');

      if (record.isValid) {
        await expect(page).toHaveURL(/dashboard/);
        await expect(page.locator('.welcome-message')).toBeVisible();
      } else {
        await expect(page.locator('.error-message')).toBeVisible();
        await expect(page.locator('.error-message')).toContainText('Invalid');
      }
    });
  }
});