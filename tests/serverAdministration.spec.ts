import { expect, test } from '@playwright/test';
import { ServerAdministrationPage } from '../pages/ServerAdministrationPage';
import { serverAdministrationConfig as settings } from '../test-data/serverAdministration.config';

const masterUrl = settings.masterUrl;

test.use({ video: 'off', trace: 'retain-on-failure' });

test.describe('Server administration', () => {
    test.describe.configure({ mode: 'default', retries: 0 });
    test.setTimeout(90000);

    for (const server of [
        { name: 'Master', url: masterUrl, version: settings.expectedVersion },
    ]) {
        test(`${server.name}: installation history matches the running version`, async ({ page }) => {
            const admin = new ServerAdministrationPage(page);
            await admin.signIn(server.url!, settings.adminUsername, settings.adminPassword);
            const version = page.getByText('Server Version', { exact: true })
                .locator('..').locator('.esko_infotext');
            await expect(version).toHaveText(/\d+\.\d+\s*-\s*build\s+\d+/);
            const runningVersion = (await version.innerText()).trim();
            if (server.version) {
                expect(runningVersion).toBe(server.version);
            }
            await admin.openSection('Installation History');
            await expect(page.getByRole('cell', {
                name: `Installed Automation Engine ${runningVersion}`, exact: true,
            })).toBeVisible();
        });

        test(`${server.name}: signing out returns to the login window`, async ({ page }) => {
            const admin = new ServerAdministrationPage(page);
            await admin.signIn(server.url!, settings.adminUsername, settings.adminPassword);
            await admin.signOut();
        });
    }

    test.describe('Master checks', () => {
        test.beforeEach(async ({ page }) => {
            await new ServerAdministrationPage(page).signIn(
                masterUrl, settings.adminUsername, settings.adminPassword,
            );
        });

        test('My Workspace: current upload folder matches the expected folder', async ({ page }) => {
            const expectedFolder = settings.expectedUploadFolder;
            await new ServerAdministrationPage(page).openSection('My Workspace');
            await expect(page.getByText(expectedFolder!, { exact: false })).toBeVisible();
        });

        test('SQL Server: configured server and MSSQLSERVER instance are running', async ({ page }) => {
            const admin = new ServerAdministrationPage(page);
            await admin.openSection('SQL Server');
            const sqlServer = settings.sqlServer;
            await expect(page.getByRole('button', { name: sqlServer, exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'MSSQLSERVER', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Stop the SQL Server', exact: true }))
                .toBeVisible({ timeout: 30000 });
            await expect(page.getByText('Running', { exact: true }).filter({ visible: true }).first()).toBeVisible();
            await expect(page.getByRole('button', { name: 'Unlock', exact: true })).toBeVisible();
        });

        test('Maintenance: rebuild all database indexes now', async ({ page }) => {
            test.skip(!settings.runMaintenance, 'Enable runMaintenance in test-data/serverAdministration.config.ts.');
            test.setTimeout(20 * 60 * 1000);
            const admin = new ServerAdministrationPage(page);
            await admin.openSection('Maintenance');
            await admin.runMaintenanceNow();
        });

        test('Maintenance: add an hourly schedule for all database indexes', async ({ page }) => {
            test.skip(!settings.runSchedules, 'Enable runSchedules in test-data/serverAdministration.config.ts.');
            const admin = new ServerAdministrationPage(page);
            await admin.openSection('Maintenance');
            await admin.unlock();
            try {
                const hourlyRows = page.getByRole('row').filter({ hasText: /Hourly/i }).filter({ visible: true });
                const previousCount = await hourlyRows.count();
                await page.getByRole('button', { name: 'Add Maintenance Schedule', exact: true }).click();
                await admin.selectDatabaseIndexes('editmaintenance');
                await page.getByRole('button', { name: 'Weekly', exact: true }).filter({ visible: true }).click();
                await page.getByRole('button', { name: 'Hourly', exact: true }).click();
                await page.locator('#ae_input_editmaintenance_frequency').fill('1');
                const time = admin.currentTime();
                await page.locator('#ae_input_editmaintenance_starttime').fill(time.text);
                await page.getByRole('button', { name: 'OK', exact: true }).click();
                await expect(hourlyRows).toHaveCount(previousCount + 1);
                await expect(hourlyRows.last()).toContainText(/Jobs/);
                await expect(hourlyRows.last()).toContainText(/Task History/);
            } finally {
                if (await page.getByRole('button', { name: 'Close', exact: true }).filter({ visible: true }).count()) {
                    await admin.closeDialog();
                }
                await admin.lock();
            }
        });

        test('Backup: add hourly Configuration schedule keeping one backup', async ({ page }) => {
            const admin = new ServerAdministrationPage(page);
            await admin.openSection('Backup');
            await admin.addHourlyConfigurationBackupSchedule();
            await expect(page.getByRole('button', { name: 'Unlock', exact: true })).toBeVisible();
        });
    });
});