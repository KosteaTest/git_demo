import {type Locator, type Page} from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorEmailMessage: Locator;
    readonly errorPasswordMessage: Locator;
    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByTestId('email');
        this.passwordInput = page.getByTestId('password');
        this.loginButton = page.getByTestId('login-submit');
        this.errorEmailMessage = page.getByTestId('email-error');
        this.errorPasswordMessage = page.getByTestId('password-error');
    }
    async open(): Promise<void> {
        await this.page.goto('https://practicesoftwaretesting.com/auth/login');
    }
    async login(email: ('customer@practicesoftwaretesting.com'), password: ('welcome01')): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}