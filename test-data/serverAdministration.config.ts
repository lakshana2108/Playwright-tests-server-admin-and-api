function requiredSetting(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing ${name}. Copy .env.example to .env and set the value.`);
    }
    return value;
}

export const serverAdministrationConfig = {
    masterUrl: requiredSetting('AE_MASTER_URL'),
    pilotUrl: requiredSetting('AE_PILOT_URL'),
    adminUsername: requiredSetting('AE_ADMIN_USERNAME'),
    adminPassword: requiredSetting('AE_ADMIN_PASSWORD'),
    pilotUsername: requiredSetting('AE_PILOT_USERNAME'),
    pilotPassword: requiredSetting('AE_PILOT_PASSWORD'),
    expectedVersion: process.env.AE_EXPECTED_VERSION ?? '',
    expectedUploadFolder: requiredSetting('AE_EXPECTED_UPLOAD_FOLDER'),
    sqlServer: requiredSetting('AE_SQL_SERVER'),
    runMaintenance: false,
    runSchedules: false,
    maintenanceSuccessText: '',
};