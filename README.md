# Water Tracker

A small local-first Progressive Web App for hydration tracking, achievements, plant growth, and a completed-plant garden.

## Production entry point

`index.html` is the only supported application entry point. The old versioned/legacy app has been removed from the active codebase.

## Architecture

Production code lives under `v1/`:

- `v1/js/storage.js` — state schema, one-time legacy migration, validation, import/export, targeted updates
- `v1/js/hydration.js` — drinks, undo/reset/restore, cups, goals
- `v1/js/stats.js` — lifetime totals, streaks, goal days, averages
- `v1/js/plants.js` — plant catalog, stages, completion, Mystery Seed handoff
- `v1/js/engagement.js` — achievements, daily wins, level/XP, plant view model
- `v1/js/pixel-plant.js` — plant rendering/effects only
- `v1/js/garden.js` — completed plant garden
- `v1/js/telemetry.js` — automatic compact usage reporting
- `v1/js/app.js` — main UI orchestration
- `v1/js/ui-extras.js` — update banner, cup edit mode, dialog scrolling, small UI helpers

Plant artwork is documented in `v1/assets/plants/README.md`.

## State safety rules

- `waterTracker_v2` is the single current user-visible state key.
- Legacy keys are read **only when `waterTracker_v2` does not exist**.
- Schema bumps require an explicit migration in `v1/js/storage.js` before `schemaVersion` is increased.
- Settings and imports are validated in the domain/storage layer, not only by HTML inputs.
- Feature modules that touch only one domain should use `WT_V1_STORAGE.update()` instead of overwriting a stale whole-state snapshot.

## PWA update rules

- `v1/js/config.js`, `v1-version.txt`, and `service-worker.js` must use the same app/cache version.
- The service worker must successfully cache the complete core app shell before activating.
- Only caches whose names start with `water-tracker-` may be removed by Water Tracker.
- The in-app Update button must never clear the known-good app cache before the replacement worker is ready.

## Validation

Run:

```bash
node scripts/validate.mjs
```

The permanent GitHub Actions validation workflow runs the same audit on pushes and pull requests. It checks file references, version alignment, plant assets, migration behavior, settings/import validation, streak calculations, plant handoff behavior, and JavaScript syntax.

## Telemetry and privacy

Telemetry is automatic in the current app and has no opt-out. It sends a random install ID plus compact usage/app summary information; full drink-by-drink history and cup names remain local. See `PRIVACY.md` and `TELEMETRY_SETUP.md`.
