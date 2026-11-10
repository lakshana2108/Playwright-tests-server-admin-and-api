import { expect, type Page } from '@playwright/test';
import { LoginPage } from './LoginPage';

export interface BackupSchedule {
    id: string;
    schedule: {
        schedulingType: string;
        frequency: number;
        startTime: string;
    };
    databasesIncluded: boolean;
    resourcesIncluded: boolean;
    nrOfBackupsToKeep: number;
}

export class ServerAdministrationPage {
    constructor(readonly page: Page) {}

    async signIn(url: string, username: string, password: string) {
        const loginPage = new LoginPage(this.page);
        await this.page.goto(url);
        await expect(loginPage.signInHeading).toBeVisible({ timeout: 30000 });
        await loginPage.login(username, password);

        const serverAdmin = this.page.getByRole('link', { name: 'Server Admin', exact: true });
        const statusHeading = this.page.getByRole('heading', { name: /status overview/i });
        await expect(serverAdmin).toBeVisible({ timeout: 30000 });
        await loginPage.dismissPreferences();
        await serverAdmin.click();
        await expect(statusHeading).toBeVisible({ timeout: 30000 });
    }

    async openSection(name: string) {
        await this.page.getByRole('button', { name, exact: true }).click();
        await expect(this.page.getByRole('heading', { name, exact: true })).toBeVisible();
    }

    async unlock() {
        await this.page.getByRole('button', { name: /^(unlock|unlock page)$/i }).click();
    }

    async lock() {
        await this.page.getByRole('button', { name: /^(lock|lock page)$/i }).click();
    }

    currentTime() {
        const now = new Date();
        return {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            text: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`,
        };
    }

    async selectDatabaseIndexes(mode: 'editmaintenance' | 'startmaintenance') {
        const checkboxes = this.page.locator(`input[id^="ae_input_${mode}_"][type="checkbox"]`);
        await expect(checkboxes).toHaveCount(7);
        for (const checkbox of await checkboxes.all()) {
            if (!await checkbox.isChecked()) {
                const id = await checkbox.getAttribute('id');
                await this.page.locator(`label[for="${id}"]`).click();
            }
            await expect(checkbox).toBeChecked();
        }
    }

    async closeDialog() {
        await this.page.getByRole('button', { name: 'Close', exact: true })
            .filter({ visible: true }).last().click();
    }

    async signOut() {
        await this.page.locator('#ae_menu_logon').click();
        await this.page.getByText('Sign Out', { exact: true }).click();
        await new LoginPage(this.page).verifyLoginPageVisible();
    }

    private async readAction<Result>(action: string, data: object): Promise<Result> {
        const url = new URL(`/serveradmin/services/actions/${action}`, this.page.url());
        const response = await this.page.request.post(url.toString(), { data, timeout: 30000 });
        expect(response.ok(), `${action} returned HTTP ${response.status()}`).toBeTruthy();
        const result = await response.json();
        expect(result.status, `${action}: ${result.message ?? 'server action failed'}`).toBe('ok');
        return result.data as Result;
    }

    async backupSchedules() {
        const result = await this.readAction<{ items: BackupSchedule[] }>('getBackupSchedules', {});
        return result.items;
    }

    async runMaintenanceNow() {
        await this.page.getByRole('button', { name: 'Start Maintenance Now', exact: true }).click();
        await this.selectDatabaseIndexes('startmaintenance');
        const dialog = this.page.locator('#ae_dialog_startmaintenance');
        const [response] = await Promise.all([
            this.page.waitForResponse(response =>
                new URL(response.url()).pathname.endsWith('/startMaintenance')
                && response.request().method() === 'POST', { timeout: 19 * 60 * 1000 }),
            dialog.getByRole('button', { name: 'Start', exact: true }).click(),
        ]);
        expect(response.ok()).toBe(true);
        const result = await response.json();
        expect(result.status, result.message ?? 'Maintenance request failed').toBe('ok');
        await expect(dialog.getByText(/maintenance.*completed/i)).toBeVisible({ timeout: 30000 });
        await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
        await expect(dialog).toBeHidden();
    }

    async addHourlyConfigurationBackupSchedule() {
        const rows = this.page.getByRole('row').filter({ hasText: 'Configuration' }).filter({ visible: true });
        const existingSchedules = await this.backupSchedules();
        await expect(rows).toHaveCount(existingSchedules.length);
        const previousCount = await rows.count();
        await this.unlock();
        try {
            await this.page.getByRole('button', { name: 'Add Backup Schedule', exact: true }).click();
            await this.page.locator('#sa_input_backupschedule_schedulingtype').click();
            await this.page.getByRole('button', { name: 'Hourly', exact: true }).click();
            await this.page.locator('#sa_input_backupschedule_frequency').fill('1');
            await expect(this.page.locator('#sa_input_backupschedule_backupcontents')).toHaveText('Configuration');
            await this.page.locator('#sa_input_backupschedule_nrofbackupstokeep').fill('1');
            const time = this.currentTime();
            const timeField = '#sa_input_backupschedule_starttime_time';
            const meridiem = time.hours >= 12 ? 'PM' : 'AM';
            await this.page.locator(`${timeField}_showTimePicker`).click();
            await this.page.locator(`${timeField}_timepicker_hours`).fill(String(time.hours % 12 || 12));
            await this.page.locator(`${timeField}_timepicker_hours`).press('Tab');
            await this.page.locator(`${timeField}_timepicker_minutes`).fill(String(time.minutes));
            await this.page.locator(`${timeField}_timepicker_minutes`).press('Tab');
            await this.page.getByRole('button', { name: meridiem, exact: true }).click();
            await this.page.locator(`${timeField}_showTimePicker`).click();
            await expect(this.page.locator(timeField))
                .toHaveValue(`${time.hours % 12 || 12}:${String(time.minutes).padStart(2, '0')} ${meridiem}`);

            const [response] = await Promise.all([
                this.page.waitForResponse(response =>
                    new URL(response.url()).pathname.endsWith('/saveBackupSchedule')
                    && response.request().method() === 'POST'),
                this.page.locator('#sa_dialog_backupschedule_confirm').click(),
            ]);
            expect(response.ok()).toBe(true);
            const result = await response.json();
            expect(result.status).toBe('ok');
            const schedule = result.data.item as BackupSchedule;
            expect(schedule.id).toBeTruthy();
            expect(schedule).toMatchObject({
                databasesIncluded: false,
                resourcesIncluded: false,
                nrOfBackupsToKeep: 1,
                schedule: { frequency: 1 },
            });
            expect(String(schedule.schedule.schedulingType).toUpperCase()).toBe('HOURLY');
            const submitted = response.request().postDataJSON().item;
            expect(schedule.schedule.startTime).toBe(submitted.schedule.startTime);
            const persisted = (await this.backupSchedules()).find(item => item.id === schedule.id);
            expect(persisted).toMatchObject({ ...schedule });
            await expect(rows).toHaveCount(previousCount + 1);
            return schedule;
        } finally {
            const close = this.page.locator('#sa_dialog_backupschedule_close');
            if (await close.isVisible()) {
                await close.click();
            }
            await this.lock();
            await expect(this.page.getByRole('button', { name: 'Unlock', exact: true })).toBeVisible();
        }
    }

}