import { Page, expect } from '@playwright/test';

export class ServerActivityPage {

    constructor(private page: Page) {}

    get serverActivityMenu() {
        return this.page
            .getByText('SERVER ACTIVITY')
            .first();
    }

    get connectedClientsTitle() {
        return this.page.getByRole('heading', { name: /Connected Clients/i });
    }

    async openServerActivity() {
        await this.serverActivityMenu.click();
    }

    async verifyConnectedClientsCount(
        count: number
    ) {
        await expect(
            this.connectedClientsTitle
        ).toContainText(`(${count})`, { timeout: 30000 });
    }

    async getConnectedClientsText() {
        return await this.connectedClientsTitle
            .textContent();
    }

    async getConnectedClientsCount() {
        const text =
            await this.connectedClientsTitle
                .textContent();

        const match =
            text?.match(/\((\d+)\)/);

        return Number(match?.[1]);
    }
}