# Water Tracker Privacy

Water Tracker is a local-first app. Your drink-by-drink hydration history, cup names/sizes, settings, backups, achievements, and plant records are stored in browser storage on the device where you use the app. There is no user account or cloud sync.

Water Tracker also sends a small automatic usage report to the app owner's Google Apps Script/Google Sheet backend. This reporting is part of the current app and does not include an opt-out.

Usage reports can include:

- a random persistent install ID and temporary session ID
- event name and event time
- app version, device platform, Home Screen/browser status, screen, locale, and timezone
- optional birthday, if you enter one for the Birthday Hydration badge
- summary hydration statistics such as today's total/goal, lifetime ounces, goal days, tracked days, and streak counts
- summary plant progress and achievement counts

For a drink-log event, the event-specific data includes the number of ounces logged and whether it was added to today or a previous day. Usage reports do **not** upload your full drink history, cup names, or an account name/email because Water Tracker has no account system.

The usage reports are used to understand app behavior and improve future versions. They are not used for advertising and are not sold to advertisers.

GitHub Pages hosts the application files. The telemetry backend is separate from GitHub Pages.

## Local data limitation

Because the main app data is local to the browser/Home Screen app, clearing site data or removing the Home Screen app can erase local history. Use the Export feature if you want a backup before clearing data or changing devices.
