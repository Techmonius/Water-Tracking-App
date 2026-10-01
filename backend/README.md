# Water Tracker backend replacement

Open `WaterTrackerBackend.gs` and copy its entire contents.

1. Open the existing **Water Tracker Backend** spreadsheet → **Extensions → Apps Script**.
2. Save a copy of the current script, then replace the existing backend code with this file. Keep just one `doPost`, `doGet`, and setup implementation in the project.
3. Save, select `setupWaterTracker`, and click **Run**. Authorize access to the spreadsheet. Do not run `doPost` from the editor: it expects a web request.
4. The first setup renames the existing Dashboard and events tabs to dated archives and creates the new tabs. Re-running setup does not archive them again or erase collected events.
5. Select **Deploy → Manage deployments → Edit (pencil)** on the existing web-app deployment. Choose **New version**, retain **Execute as: Me** and the existing public **Anyone** access, then deploy. Updating the existing deployment preserves the `/exec` URL already used by the app. Do not create a new deployment URL.
6. Open app 1.9.6, log a drink, and check the new events row and dashboard's Last event received. Version 1.9.5 reports are also accepted, but cannot identify quick-add versus saved-cup versus custom input.

## What changes

- Dashboard first; received-at timestamp, event count, unique installations, today's events, active installations today and last seven calendar days, missing-birthday report count, event/feature/version breakdowns.
- Events: Timestamp, Event, Summary, Feature, Amount logged (oz), App version, Device, Birthday, Details. Installation IDs and receipt timestamps are hidden in J/K to power the dashboard. Hidden columns are not security controls.
- Chicago time for timestamps and day boundaries. Event counts today use event timestamp; last event received uses server receipt time. Very-future/invalid timestamps fall back to server time.
- Retains all newly received events, not only the last 200. Archived events stay intact but are excluded from new dashboard counts. Counts start at setup and are never labeled lifetime totals.
- The current full-date birthday is preserved. New app users and existing users without a valid birthday must enter one. Backend still accepts missing birthdays from older clients, so those reports are not silently discarded.
- Logging amounts appear only for drink additions; corrections and action outcomes appear in Summary/Details. No cup names or user-entered free text are transmitted by the new app.

## Verification limits

The JavaScript syntax, label mapping, input validation and app-side reporting/gate behavior are regression-tested locally. Apps Script execution, formula rendering in your workbook, authorization and a live end-to-end upload must be verified after you deploy. The app sends reports best-effort using a no-CORS request: delivery is not acknowledged to the app and offline events are not queued. Unique installations can count one person more than once across browsers/devices or after storage reset.
