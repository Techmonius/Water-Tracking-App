# Water Tracker Beta Telemetry Setup

Telemetry is enabled in the app and points to the Google Apps Script endpoint used for the beta.

## Sheet tab

Use one tab named:

```text
events
```

Recommended header row:

```text
Received At	App Time	Local Date	Local Time	Event	Summary	Install ID	Session ID	Version	Device	Screen	Timezone	Standalone	Raw Data
```

## Apps Script backend

This version writes human-readable rows and trims the sheet so it does not grow forever. Change `MAX_ROWS_TO_KEEP` if you want more or fewer stored events.

```javascript
const SHEET_NAME = 'events';
const MAX_ROWS_TO_KEEP = 5000;

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Missing sheet tab named events');

    ensureHeader(sheet);

    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const receivedAt = new Date();

    sheet.appendRow([
      receivedAt,
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
      body.standalone === true ? 'Yes' : 'No',
      JSON.stringify(body.data || {})
    ]);

    trimOldRows(sheet);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureHeader(sheet) {
  const headers = [
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
    'Standalone',
    'Raw Data'
  ];

  const first = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeader = first.every(cell => cell === '');
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function trimOldRows(sheet) {
  const lastRow = sheet.getLastRow();
  const maxIncludingHeader = MAX_ROWS_TO_KEEP + 1;
  if (lastRow <= maxIncludingHeader) return;

  const rowsToDelete = lastRow - maxIncludingHeader;
  sheet.deleteRows(2, rowsToDelete);
}

function shortId(id) {
  if (!id) return '';
  return String(id).slice(0, 8);
}
```

## Deploy settings

Deploy → New deployment → Web app

Use:

- Execute as: Me
- Who has access: Anyone

After updating the Apps Script, use **Deploy → Manage deployments → Edit → New version → Deploy**.

## Storage control

The backend keeps only the latest `MAX_ROWS_TO_KEEP` events plus the header row. At the default of 5000 rows, this should stay tiny in Google Drive terms.
