import { test, expect } from '@playwright/test';
import { serverAdministrationConfig as settings } from '../test-data/serverAdministration.config';

test('GET API Test', async ({ request }) => {

    const response = await request.get(
        settings.masterUrl
    );

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');

});

test('POST API Test', async ({ request }) => {

    const response = await request.post(
        'https://reqres.in/api/users',
        {
            data: {

                name: 'Lakshana',
                job: 'QA Engineer'

            }
        }
    );

    console.log(await response.json());

    expect(response.status()).toBe(201);

});

test('PUT API Test', async ({ request }) => {

    const response = await request.put(
        'https://reqres.in/api/users/2',
        {
            data: {

                name: 'Lakshana Updated',
                job: 'Senior QA'

            }
        }
    );

    console.log(await response.json());

    expect(response.status()).toBe(200);

});

test('DELETE API Test', async ({ request }) => {

    const response = await request.delete(
        'https://reqres.in/api/users/2'
    );

    expect(response.status()).toBe(204);

});