# 1.9.6 — required birthday and specific usage reporting

Users without a valid saved birthday must complete a modal form before continuing. Escape and closing cannot dismiss the requirement. Successful saves refresh the app and report birthday_saved; a failed save keeps the form open. Existing birthdays and hydration history are preserved. Settings reject an empty, invalid or future birthday. Importing a backup without a birthday reopens the form. Birthday disclosure appears in both the form and settings.

Reports distinguish quick-add, custom amounts, saved cups, and selected-day logging, with the actual log date. They identify individual drink deletion, Undo result, day resets/restores, cup creation/edit/deletion, backup requests/imports, settings changes, screen and garden views, mystery-seed planting, history expansion and app resume. Cup names are excluded. Windows/macOS/Linux/iPadOS are identified where the browser user agent permits. Reporting exceptions cannot interrupt a water entry.

The accompanying backend/WaterTrackerBackend.gs must be manually installed by the owner. It archives the old tabs, creates a Chicago-time dashboard and events table, hides IDs while retaining unique-installation counts, and retains future events. Old archived records are excluded from the explicitly labeled new reporting period. Reports from older apps remain accepted and unspecified details are labeled rather than guessed.

Validation: complete application/service-worker suite plus required-birthday, failure-path, telemetry-to-backend mapping, birthday validation, and backend row-mapping tests. No physical iPhone or live Google Apps Script execution verified. Reporting remains best-effort, with no offline queue or delivery acknowledgement.
