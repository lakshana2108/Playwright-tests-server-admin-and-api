# Server Administration Tests

Run the only backup test:

```powershell
npx playwright test tests/serverAdministration.spec.ts --project=chromium --workers=1 --retries=0 --grep 'Backup: add hourly Configuration'
```

This test adds the schedule through the UI, verifies the saved settings and table row, locks the page, and finishes. The schedule remains saved. Each rerun adds another schedule; existing schedules are not changed or removed.

Copy `.env.example` to `.env` and set the values for your dedicated test environment before running application tests. `.env` is ignored by Git and must never be committed. Credentials are passed to the login page explicitly; no default account or password is embedded in the framework.

Each test uses a new browser session. Tests in this suite run sequentially, even with the existing fullyParallel configuration. Do not run other server-changing suites at the same time.

## Separate Scenarios

| Test | Prerequisites / Scope |
| --- | --- |
| Master installation history | Checks the running version against expectedVersion and an installation history entry. |
| Master sign-out | Verifies the sign-in heading and login URL after signing out. |
| My Workspace upload folder | Checks expectedUploadFolder. Reports a mismatch rather than changing the folder. |
| SQL Server instance | Verifies sqlServer, MSSQLSERVER instance, Running status, and locked page. Does not authenticate as SA or verify database contents. |
| Immediate maintenance | Enable runMaintenance and set maintenanceSuccessText. Selects all seven index categories, starts maintenance, waits up to 19 minutes for that message, and closes the dialog. Completion handling has not been live-validated. |
| Hourly maintenance schedule | Enable runSchedules. Selects all seven index categories, Every 1 Hour, current runner time, saves, and checks for an added hourly table row. |
| Configuration backup schedule creation | Adds and verifies the hourly schedule and locks the page. Leaves the schedule saved. No backup-execution wait. |

Assistant checks are excluded as requested. Maintenance tests remain disabled by default. The backup test is active and leaves a recurring schedule on the server. Use the dedicated test server and avoid overlapping maintenance with scheduled backups. The runner and server must use the same local timezone and synchronized clocks.

## Backup Scenario

Only schedule creation is included:

1. Sign in and open Backup.
2. Wait for existing schedule rows to load, then unlock the page and select Add Backup Schedule.
3. Set Frequency to Hourly, Every to 1 Hour, Start Time to the current time, Backup to Configuration, and Keep only last to 1 backup.
4. Save and verify the persisted settings and the additional Configuration row.
5. Lock the page and finish, leaving the schedule saved.

All other backup tests, retention utilities, polling, filesystem checks, and long-running timeout settings have been removed. The test does not wait for a backup, inspect retention, create a Full backup, stop the server, delete files or databases, or restore anything. It uses the server's current backup folder without enforcing a drive path.

Example read-only selection:

```powershell
npx playwright test tests/serverAdministration.spec.ts --project=chromium --workers=1 --retries=0 --grep 'Master:|SQL Server:'
```

## Remaining Environment-Dependent Checks

These are not implemented or claimed as passing by this suite:

| Checklist Area | Required Follow-Up |
| --- | --- |
| Graphic task takeover | Assistant URL, Pilot/workflow automation, Platform Testing inputs, and execution evidence identifying the Assistant as the worker. Changing the master checkbox alone is not proof of takeover. |
| Concurrent viewing limits | Master and Assistant configuration plus distinct sample PDFs, real viewer sessions, and verification of the actual limit error for the third/fourth tab. Restore original capabilities afterward. |
| Scheduled maintenance after one hour | Wait for the scheduled execution, download aesrvlogs.zip, select the newest bgmd entry by ZIP timestamp, and match the maintenance event and scheduled server-local time on the same log line/event. The existing log-download test verifies archive contents only. |
| Full backup and destructive restore | Excluded from the backup scenario as requested. No deletion, stop/activate, or restore action is executed by these tests. |
| Database move | SA authentication, both BSJobs file paths, access to the source/destination folders on the server, connection termination, server restart, and a successful Platform Testing run afterward. |
| My Workspace upload workflow | Upload-folder change, the actual PDF and ZIP workflow, My Workspace launch, and access to ExampleJobContainer/ShuttleUploadFolder to verify the new internal-ID folder and PDF. |

## Live Inspection Notes

Live server names, paths, versions, and other environment-specific observations belong in the local `.env` file or internal team documentation, not in this public repository.

The remaining backup schedule test passed on the live server and left its schedule saved. Login now allows up to 30 seconds for the form to load. Schedule creation waits for existing table rows before recording the starting count. Time-picker edits are committed using Tab, and dialog cleanup uses the backup dialog's own Close control. The existing master login/sign-out test passed in a prior run.