import { Page, expect } from '@playwright/test';

export class LoginPage {

    constructor(private page: Page) {}

    // LOCATORS
    get usernameInput() { return this.page.getByRole('textbox').first(); }
    get passwordInput() { return this.page.getByRole('textbox').nth(1); }
    get signInButton() { return this.page.getByRole('button', { name: 'Sign In' }); }
    get signInHeading() {
        return this.page.getByRole('heading', { name: 'SIGN IN' });
    }
    get errorMessage() { return this.page.getByText(/password appears to be incorrect/i); }
    get userProfileButton() {
        return this.page.locator('#ae_menu_logon');
    }
    get logoutButton() { return this.page.getByText('Sign Out'); }
    get closePreferencesButton() { return this.page.getByRole('button', { name: 'Close' }); }

    // METHODS
    async gotoLoginPage(url: string) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });

        await expect(this.signInHeading)
            .toBeVisible({ timeout: 15000 });
    }

    // LOGIN METHOD
    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.signInButton.click();
    }

    // DISMISS PREFERENCES DIALOG
    async dismissPreferences() {
        await this.closePreferencesButton.waitFor({ state: 'attached', timeout: 15000 });
        await this.closePreferencesButton.dispatchEvent('click');
    }

    // VERIFY SUCCESSFUL LOGIN
async verifySuccessfulLogin() {

    await expect(this.page)
        .toHaveURL(/serveradmin/);

}

async verifyErrorMessage() {

        await expect(this.errorMessage)
            .toBeVisible();

    }

     async verifyLoginPageVisible() {

        await expect(this.signInHeading)
            .toBeVisible();

        await expect(this.page)
            .toHaveURL(/login/);

    }


    // LOGOUT
    async logout() {
        console.log('Clicking profile');
        await this.userProfileButton.click();
        console.log('Clicking logout');
        await this.logoutButton.click();
    }
}