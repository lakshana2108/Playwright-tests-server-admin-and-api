import { expect, test } from '@playwright/test';
import AdmZip from 'adm-zip';

import { LoginPage } from '../pages/LoginPage';
import { StatusOverviewPage } from '../pages/StatusOverviewPage';
import { serverAdministrationConfig as settings } from '../test-data/serverAdministration.config';

test('Verify Status Overview Page', async ({ page }) => {
      test.setTimeout(500000);

    const loginPage =
        new LoginPage(page);

    const statusPage =
        new StatusOverviewPage(page);



    await loginPage.gotoLoginPage(settings.masterUrl);


    await loginPage.login(
        settings.adminUsername,
        settings.adminPassword
    );
await statusPage.openServerAdmin();

await statusPage.verifyStatusOverviewLoaded();

const download =
    await statusPage.downloadLogs();

console.log(await download.suggestedFilename());
console.log(
    await download.failure()
);

    const filePath =
    await download.path();

console.log(filePath);

const zip =
    new AdmZip(filePath!);

const entries =
    zip.getEntries();

const fileNames =
    entries.map(
        (entry: AdmZip.IZipEntry) => entry.entryName
    );

// VERIFY appserver.log
expect(
    fileNames.some(
        (file: string) => file.includes('appserver.log')
    )
).toBeTruthy();

// VERIFY bgmd*.log
expect(
    fileNames.some(
        (file: string) => file.toLowerCase().includes('bgmd')
    )
).toBeTruthy();

// VERIFY dvd_ae*.log
expect(
    fileNames.some(
        (file: string) => file.toLowerCase().includes('dvd_ae')
    )
).toBeTruthy();

// VERIFY fastserver*.log
expect(
    fileNames.some(
        (file: string) => file.toLowerCase().includes('fastserver')
    )
).toBeTruthy();
});