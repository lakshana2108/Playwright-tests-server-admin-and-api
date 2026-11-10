import { test, expect } from '@playwright/test';

test('Debug Shopping Cart', async ({ page }) => {

    // OPEN WEBSITE
    await page.goto(
    'https://www.saucedemo.com/'
    );



    // LOGIN
    await page.getByPlaceholder('Username')
    .fill('standard_user');

    await page.getByPlaceholder('Password')
    .fill('secret_sauce');

    await page.getByRole('button',
    { name: 'Login' }).click();



    // BUG 1 → WRONG PRODUCT TEXT
    await page.getByText('Sauce Labs Backpack')
    .first()
    .click();



    // BUG 2 → WRONG BUTTON TEXT
    await page.getByRole('button', { name: 'Add to cart' })
    .click();



    // BUG 3 → WRONG ASSERTION
    await expect(
        page.locator('.shopping_cart_badge')
    ).toHaveText('1');

});