import fs from 'fs';
import path from 'path';
import { test, expect } from '../fixtures';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

test('confirms the account page is open', async ({ loggedInPage }) => {
  await expect(loggedInPage).toHaveURL(/.*\/account/);
  await expect(loggedInPage.getByTestId('page-title')).toHaveText('My account');
});

test.describe('catalog hooks', () => {
  let suiteStartTime: number;
  let homePage: HomePage;

  test.beforeAll(() => {
    suiteStartTime = Date.now();
    console.log(`[catalog hooks] Suite started at: ${new Date(suiteStartTime).toISOString()}`);
  });

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.open();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot();
      await testInfo.attach('failure-screenshot', {
        body: screenshot,
        contentType: 'image/png',
      });
    }
  });

  test.afterAll(() => {
    const suiteEndTime = Date.now();
    const duration = suiteStartTime ? suiteEndTime - suiteStartTime : 0;
    console.log(`[catalog hooks] Suite finished at: ${new Date(suiteEndTime).toISOString()} (duration: ${duration}ms)`);
  });

  test('confirms the catalog page loaded', async ({ page }) => {
    await expect(page).toHaveTitle(/Practice Software Testing/);
    await expect(page.getByTestId('product-name').first()).toBeVisible();
  });
});

const csvFilePath = path.resolve(__dirname, '../test-data/login-cases.csv');
const csvFileContent = fs.readFileSync(csvFilePath, 'utf-8');

const lines = csvFileContent
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

const headers = lines[0].split(',').map(header => header.trim());
const loginRecords = lines.slice(1).map(line => {
  const values = line.split(',').map(val => val.trim());
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = values[index];
  });
  return record;
});

test.describe('CSV driven login tests', () => {
  for (const record of loginRecords) {
    test(`login test - ${record.name} expects ${record.expectedResult}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(record.email, record.password);

      if (record.expectedResult === 'success') {
        await expect(page).toHaveURL(/.*\/account/);
      } else {
        await expect(page.getByText('Invalid email or password')).toBeVisible();
      }
    });
  }
});
