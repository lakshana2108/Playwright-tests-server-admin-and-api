import { Page, expect, type Download } from '@playwright/test';

export class StatusOverviewPage {

    constructor(private page: Page) {}

    get serverAdminLink() {
        return this.page.getByRole('link', {
            name: 'Server Admin'
        });
    }

    get statusOverviewHeading() {
        return this.page.getByRole('heading', {
            name: 'Status overview'
        });
    }

    get serverStatusRow() {
        return this.page.getByText('Server Status', { exact: true }).locator('..');
    }

    get downloadLogsButton() {
        return this.page.locator(
            '#ae_link_serverstatus_downloadlog'
        );
    }
    async openServerAdmin() {

        await this.serverAdminLink.click();

    }

    async verifyStatusOverviewLoaded() {

        await expect(
            this.statusOverviewHeading
        ).toBeVisible();
    }

    async verifyServerIsRunning() {

        await expect(this.serverStatusRow).toContainText('Running');
    }

         async downloadLogs(): Promise<Download> {

        const downloadPromise =
            this.page.waitForEvent('download');

        await this.downloadLogsButton.click();

        return await downloadPromise;
    }
}

