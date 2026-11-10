import { test, expect } from '@playwright/test';

test('Playwright Actions and Assertions', async ({ page }) => {

    // OPEN WEBSITE
    await page.goto('https://www.saucedemo.com/');



    // FILL ACTION
    await page.getByPlaceholder('Username')
    .fill('standard_user');

    await page.getByPlaceholder('Password')
    .fill('secret_sauce');



    // CLICK ACTION
    await page.getByRole('button',
    { name: 'Login' }).click();



    // URL ASSERTION
    await expect(page)
    .toHaveURL(/inventory/);



    // TEXT ASSERTION
    await expect(
        page.locator('.title')
    ).toHaveText('Products');



    // PARTIAL TEXT ASSERTION
    await expect(
        page.locator('.title')
    ).toContainText('Prod');



    // VISIBILITY ASSERTION
    await expect(
        page.locator('.inventory_list')
    ).toBeVisible();



    // HOVER ACTION
    const firstInventoryItem = page.locator('[data-test="inventory-item"]').first();
    await firstInventoryItem.hover();



    // DOUBLE CLICK
    await firstInventoryItem.dblclick();



    // RIGHT CLICK
    await firstInventoryItem.click({ button: 'right' });



    // CHECKBOX ACTION
    // await page.getByLabel('Accept').check();



    // UNCHECK ACTION
    // await page.getByLabel('Accept').uncheck();



    // DROPDOWN ACTION
    // await page.locator('#country')
    // .selectOption('India');



    // KEYBOARD ACTION
    await page.keyboard.press('PageDown');



    // SCROLLING
    await page.mouse.wheel(0, 500);



    // EXPLICIT WAIT
    await page.waitForTimeout(2000);



    // FILE UPLOAD
    // await page.setInputFiles(
    // 'input[type="file"]',
    // 'test.pdf'
    // );



    // ALERT HANDLING
    page.on('dialog', async dialog => {

        console.log(dialog.message());

        await dialog.accept();

    });



    // iframe HANDLING
    // const frame =
    // page.frameLocator('#frame');

    // await frame.getByRole('button')
    // .click();



});