import { test as base, expect, type Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

export type Fixtures = {
  loggedInPage: Page;
};

export const test = base.extend<Fixtures>({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('customer@practicesoftwaretesting.com', 'welcome01');
    await page.waitForURL('**/account');
    await use(page);
    await page.context().clearCookies();
  },
});

export { expect };