import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { StatusOverviewPage } from '../pages/StatusOverviewPage';
import { serverAdministrationConfig as settings } from '../test-data/serverAdministration.config';

test.describe('Login Tests', () => {

    test('valid admin account', async ({ page }) => {

    test.setTimeout(60000);

    const loginPage = new LoginPage(page);

    await loginPage.gotoLoginPage(settings.masterUrl);
    await page.waitForTimeout(10000);

    await loginPage.login(
        settings.adminUsername,
        settings.adminPassword
    );

    await page.waitForTimeout(5000);
    await loginPage.verifySuccessfulLogin();

    await loginPage.dismissPreferences();

    const statusOverviewPage = new StatusOverviewPage(page);
    await statusOverviewPage.openServerAdmin();
    await statusOverviewPage.verifyStatusOverviewLoaded();
    await statusOverviewPage.verifyServerIsRunning();

    await loginPage.logout();

    await loginPage.verifyLoginPageVisible();

});





test('invalid admin account', async ({ page }) => {
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);

    await loginPage.gotoLoginPage(settings.masterUrl);
    await page.waitForTimeout(10000);

    await loginPage.login(
        settings.adminUsername,
        'invalid-password'
    );
    await page.waitForTimeout(5000);
    await loginPage.verifyErrorMessage();
     await loginPage.verifyLoginPageVisible();

});

test.describe('Incomplete credentials', () => {
    const incompleteCredentials = [
        { scenario: 'both fields are empty', username: '', password: '' },
        { scenario: 'username is empty', username: '', password: 'some-password' },
        { scenario: 'password is empty', username: 'some-user', password: '' },
    ];

    for (const { scenario, username, password } of incompleteCredentials) {
        test(`stays on the login page when ${scenario}`, async ({ page }) => {
            test.setTimeout(90000);
            const loginPage = new LoginPage(page);

            await loginPage.gotoLoginPage(settings.masterUrl);
            await loginPage.login(username, password);
            await loginPage.verifyLoginPageVisible();
        });
    }
});

});