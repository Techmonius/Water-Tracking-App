# Water Tracker Beta Telemetry Setup

Telemetry is disabled by default. It only sends events after you paste your Google Apps Script web app URL into `telemetry.js` and set `enabled: true`.

## What gets collected

The app can collect beta usage events such as:

- app opened
- drink logged
- undo used
- custom amount used
- cup added / edited / deleted
- settings saved
- previous day edited
- reset today / reset day
- export / import used
- JavaScript errors

The app does **not** send cup names, drink history, exact water totals for every day, name, email, GPS, contacts, or account information.

## Step 1: Create the Google Sheet

Create a Google Sheet with one tab named:

```text
events
```

In row 1, add these headers:

```text
timestamp,installId,sessionId,version,device,screen,timezone,event,data
```

## Step 2: Create the Apps Script

In the Sheet, go to:

Extensions → Apps Script

Paste this code:

```javascript
const SHEET_NAME = 'events';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const body = JSON.parse(e.postData.contents || '{}');
    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.installId || '',
      body.sessionId || '',
      body.version || '',
      body.device || '',
      body.screen || '',
      body.timezone || '',
      body.event || '',
      JSON.stringify(body.data || {})
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3: Deploy the web app

Deploy → New deployment → Web app

Use these settings:

- Execute as: Me
- Who has access: Anyone

Copy the web app URL.

## Step 4: Enable telemetry in the app

In `telemetry.js`, change:

```javascript
endpoint: '',
enabled: false,
```

to:

```javascript
endpoint: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
enabled: true,
```

## Step 5: Test

Open the app and log one drink. A new row should appear in the `events` tab.

## Useful starter formulas

Daily active users:

```text
=COUNTUNIQUE(FILTER(B:B, A:A>=TODAY()))
```

Events by type:

```text
=QUERY(H:I,"select H, count(H) where H is not null group by H order by count(H) desc",1)
```

Versions in use:

```text
=QUERY(D:D,"select D, count(D) where D is not null group by D order by count(D) desc",1)
```
