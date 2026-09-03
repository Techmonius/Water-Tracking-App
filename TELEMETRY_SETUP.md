# Water Tracker Telemetry Backend

The app automatically sends compact usage reports to the configured Google Apps Script endpoint. The app code is already wired to the endpoint in `v1/js/telemetry.js`.

This file documents the **manual Google Sheet / Apps Script update**. Updating the Sheet is intentionally not automated from the repository.

## What the app sends

Each event includes identifying/session metadata plus a small aggregate snapshot so future versions can be evaluated without uploading full hydration logs.

Current fields include:

- event / summary
- install ID and session ID
- app version and device type
- current screen, locale, timezone, and standalone/Home Screen state
- local event date/time and ISO timestamp
- optional birthday
- today's ounces and goal
- goal mode
- lifetime ounces, goal days, tracked days, current streak, best streak
- current plant ID/stage/goal days and completed-plant count
- permanent-badge count and cumulative daily-win count
- event-specific `data` (for example, `drink_logged` includes the ounces logged and whether it was for today or a previous day)

The app does not upload the full drink history or cup names.

## Sheet tab

Use one tab named:

```text
events
```

Recommended header row:

```text
Received At	App Time	Local Date	Local Time	Event	Summary	Install ID	Session ID	Version	Device	Screen	Timezone	Locale	Standalone	Birthday	Today Oz	Today Goal	Goal Mode	Lifetime Oz	Goal Days	Tracked Days	Current Streak	Best Streak	Plant ID	Plant Stage	Plant Goal Days	Completed Plants	Permanent Badges	Daily Win Count	Raw Data
```

## Apps Script backend

Replace the current Apps Script with the code below, then deploy a **new version** of the Web App. Keep the existing deployed Web App URL so `v1/js/telemetry.js` does not need another endpoint change.

```javascript
const SHEET_NAME = 'events';
const MAX_ROWS_TO_KEEP = 5000;

const HEADERS = [
  'Received At',
  'App Time',
  'Local Date',
  'Local Time',
  'Event',
  'Summary',
  'Install ID',
  'Session ID',
  'Version',
  'Device',
  'Screen',
  'Timezone',
  'Locale',
  'Standalone',
  'Birthday',
  'Today Oz',
  'Today Goal',
  'Goal Mode',
  'Lifetime Oz',
  'Goal Days',
  'Tracked Days',
  'Current Streak',
  'Best Streak',
  'Plant ID',
  'Plant Stage',
  'Plant Goal Days',
  'Completed Plants',
  'Permanent Badges',
  'Daily Win Count',
  'Raw Data'
];

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Missing sheet tab named events');

    ensureHeader(sheet);

    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    sheet.appendRow([
      new Date(),
      body.timestamp || '',
      body.localDate || '',
      body.localTime || '',
      body.label || body.event || '',
      body.summary || body.event || '',
      shortId(body.installId),
      shortId(body.sessionId),
      body.version || '',
      body.device || '',
      body.screen || '',
      body.timezone || '',
      body.locale || '',
      body.standalone === true ? 'Yes' : 'No',
      body.birthday || '',
      numberOrBlank(body.todayOz),
      numberOrBlank(body.todayGoal),
      body.goalMode || '',
      numberOrBlank(body.lifetimeOz),
      numberOrBlank(body.goalDays),
      numberOrBlank(body.trackedDays),
      numberOrBlank(body.currentStreak),
      numberOrBlank(body.bestStreak),
      body.plantId || '',
      body.plantStage || '',
      numberOrBlank(body.plantGoalDays),
      numberOrBlank(body.completedPlants),
      numberOrBlank(body.permanentBadges),
      numberOrBlank(body.dailyWinCount),
      JSON.stringify(body.data || {})
    ]);

    trimOldRows(sheet);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureHeader(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const mismatch = HEADERS.some((header, index) => current[index] !== header);
  if (mismatch) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function trimOldRows(sheet) {
  const lastRow = sheet.getLastRow();
  const maxIncludingHeader = MAX_ROWS_TO_KEEP + 1;
  if (lastRow > maxIncludingHeader) sheet.deleteRows(2, lastRow - maxIncludingHeader);
}

function shortId(id) {
  return id ? String(id).slice(0, 8) : '';
}

function numberOrBlank(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : '';
}
```

## Manual deployment steps

1. Open the existing Apps Script project attached to the telemetry Sheet.
2. Replace the existing script with the code above.
3. Confirm the tab is named `events`.
4. Deploy → Manage deployments → Edit.
5. Choose **New version** and deploy it as the existing Web App.
6. Keep **Execute as: Me** and **Who has access: Anyone**.
7. Open Water Tracker once and verify a new row has values in the new summary columns.

The backend keeps only the newest `MAX_ROWS_TO_KEEP` events plus the header row.
