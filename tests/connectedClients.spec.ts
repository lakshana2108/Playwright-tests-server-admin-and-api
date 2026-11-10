import { test } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { StatusOverviewPage } from '../pages/StatusOverviewPage';
import { ServerActivityPage } from '../pages/ServerActivityPage';
import { serverAdministrationConfig as settings } from '../test-data/serverAdministration.config';

test('Connected Clients', async ({ browser }) => {

    test.setTimeout(120000);

    // -------------------
    // Admin User
    // -------------------

    const adminContext =
        await browser.newContext();

    const adminPage =
        await adminContext.newPage();

    const loginPage =
        new LoginPage(adminPage);

    const statusPage =
        new StatusOverviewPage(adminPage);

    const serverActivityPage =
        new ServerActivityPage(adminPage);

    await loginPage.gotoLoginPage(settings.masterUrl);

    await loginPage.login(
        settings.adminUsername,
        settings.adminPassword
    );

    await loginPage.dismissPreferences();

    await statusPage.openServerAdmin();

    await statusPage.verifyStatusOverviewLoaded();

    await serverActivityPage.openServerActivity();

    const initialCount =
    await serverActivityPage
        .getConnectedClientsCount();

console.log(
    `Initial Count = ${initialCount}`
);



    // -------------------
    // Pilot User
    // -------------------

    const pilotContext =
        await browser.newContext();

    const pilotPage =
        await pilotContext.newPage();

    const pilotLoginPage =
        new LoginPage(pilotPage);

    await pilotPage.goto(
        `${settings.pilotUrl}/#/login`
    );

    await pilotLoginPage.login(
        settings.pilotUsername,
        settings.pilotPassword
    );



    // -------------------
    // Verify Live Update
    // -------------------

    await serverActivityPage
    .verifyConnectedClientsCount(
        initialCount + 1

    );
   const updatedCount =
    await serverActivityPage
        .getConnectedClientsCount();

console.log(
    `Connected Clients After Login = ${updatedCount}`
);

    await pilotLoginPage.logout();
    await pilotLoginPage.verifyLoginPageVisible();
    await serverActivityPage
    .verifyConnectedClientsCount(
        initialCount
    );

const finalCount =
    await serverActivityPage
        .getConnectedClientsCount();

console.log(
    `Connected Clients After Logout = ${finalCount}`
);

});