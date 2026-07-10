# Water Tracker v1 Refactor Plan

## Goal

Build a clean v1 release alongside the current v26 beta without changing the normal production link until migration and testing are complete.

The current beta remains the rollback version.

## Current active entry point

`index.html` redirects to `v18.html`.

Despite the filename, `v18.html` currently loads features through v26.

## Current active files

### Core

- `config.js`
- `storage.js`
- `date.js`
- `ui.js`
- `app.js`
- `styles.css`
- `service-worker.js`

### Telemetry

- `telemetry.js`
- `app-telemetry-v18.js`

### Engagement patches

- `engagement-v22.css`
- `progress-v22.js`
- `achievements-v22.js`
- `engage-plus-v23.css`
- `plant-calendar-v23.js`
- `goal-celebration-v23.js`
- `plant-plus-v24.css`
- `living-plant-v24.js`
- `daily-wins-v26.css`
- `daily-wins-v26.js`
- `achievement-menu-v26.js`

## Confirmed current storage keys

### Persistent app data

- `waterTracker_v1`
  - goals
  - theme
  - cups
  - drink history
  - day backups

- `waterTracker_engagement_v1`
  - permanent achievement unlocks
  - legacy shapes supported: `u` and `unlocked`

- `waterTracker_dailyWins_v1`
  - daily award dates
  - lifetime daily badge counts

- `waterTracker_goalCelebrated_v1`
  - dates on which the goal popup already displayed

### Telemetry identity

- `waterTracker_installId`
  - should survive app reset

### Session-only telemetry

- `waterTracker_sessionId`
  - stored in `sessionStorage`

## Current architectural problems

### 1. Multiple sources of truth

Hydration state is stored in `waterTracker_v1`, while engagement state is split across three other keys.

This is why Clear All Data currently does not reset the entire user-visible app.

### 2. Render monkey-patching

Multiple modules replace `window.render` with a wrapper:

- progress
- achievements
- plant/calendar
- goal celebration
- living plant
- daily wins

Behavior depends on script loading order. A failure in one wrapper can prevent downstream engagement features from updating.

### 3. Duplicate calculations

Several modules separately calculate:

- daily total
- goal completion
- lifetime ounces
- goal days
- streaks
- drink timestamps

These calculations should live in one statistics/domain module.

### 4. Achievement definitions are duplicated

Permanent achievement metadata exists in both:

- `achievements-v22.js`
- `achievement-menu-v26.js`

Daily win metadata is separately exposed from `daily-wins-v26.js`.

### 5. Versioned patch filenames are now misleading

`v18.html` is the live entry page but contains features through v26. This makes debugging and maintenance confusing.

### 6. Clear All Data is incomplete

`app.js` only removes the configured hydration storage key. It does not remove user-visible engagement data.

## Clean v1 structure

```text
v1.html
v1/
  css/
    app.css
    engagement.css
  js/
    config.js
    storage.js
    migration.js
    hydration.js
    stats.js
    achievements.js
    plant.js
    calendar.js
    telemetry.js
    ui.js
    app.js
```

## Proposed single v1 data model

Store all user-visible app data under one key:

`waterTracker_v2`

```javascript
{
  schemaVersion: 2,
  settings: {
    goalMode: 'daily',
    dailyGoal: 120,
    weekdayGoal: 120,
    weekendGoal: 100,
    theme: 'system'
  },
  cups: [
    { id: '...', name: 'Stanley', oz: 40 }
  ],
  days: {
    '2026-07-09': {
      drinks: [
        {
          id: '...',
          oz: 20,
          label: 'Quick add',
          at: '2026-07-09T15:00:00.000Z'
        }
      ]
    }
  },
  backups: {},
  engagement: {
    permanent: {
      first: { count: 1, firstEarnedAt: '...' }
    },
    daily: {
      counts: {
        firstToday: 12,
        earlyBird: 5,
        halfway: 7,
        dailyGoal: 9
      },
      earnedByDate: {
        '2026-07-09': {
          firstToday: '...',
          earlyBird: '...'
        }
      }
    },
    celebrations: {
      goalByDate: {
        '2026-07-09': '...'
      }
    }
  }
}
```

The anonymous telemetry install ID remains in its existing separate key and is not exported as user hydration data.

## Migration rules

On first v1 launch:

1. Read `waterTracker_v2`.
2. If it exists, normalize it and continue.
3. Otherwise read `waterTracker_v1`.
4. Merge permanent achievements from either `u` or `unlocked` in `waterTracker_engagement_v1`.
5. Merge daily counts and earned dates from `waterTracker_dailyWins_v1`.
6. Merge goal celebration dates from `waterTracker_goalCelebrated_v1`.
7. Save the combined state to `waterTracker_v2`.
8. Keep the old keys temporarily for rollback.
9. Mark migration complete in the v2 state.

## Reset behavior

Clear All Data in v1 should remove:

- `waterTracker_v2`
- `waterTracker_v1`
- `waterTracker_engagement_v1`
- `waterTracker_dailyWins_v1`
- `waterTracker_goalCelebrated_v1`

It should preserve:

- `waterTracker_installId`

The confirmation must explicitly mention hydration history, settings, cups, plant progress, achievements, and badge counts.

## Export/import behavior

The v1 export should include the entire `waterTracker_v2` user-visible state, including achievements and badge counts.

Import should:

- validate `schemaVersion`
- normalize missing fields
- reject malformed drink records
- preserve the telemetry install ID

## UI ownership

### `hydration.js`

- add drink
- undo
- reset day
- edit previous day
- cups
- goals

### `stats.js`

- daily totals
- lifetime ounces
- streaks
- goal days
- completion percentage
- averages
- timestamps

### `achievements.js`

- all badge definitions
- permanent unlocks
- repeatable daily wins
- badge counts
- popup queue

### `plant.js`

- stage calculation
- health/mood
- SVG rendering
- growth progress

### `calendar.js`

- month model
- heat-map rendering
- selected-day details

### `storage.js`

- load
- save
- normalize
- reset
- export/import

### `ui.js`

- dialogs
- toast queue
- navigation/pages
- render orchestration

## Rollout plan

1. Keep v26 untouched and available.
2. Build `v1.html` and the `v1/` modules alongside it.
3. Implement migration and storage tests first.
4. Port hydration behavior.
5. Port achievements and daily wins.
6. Port plant/calendar/celebrations.
7. Add statistics and developer pages.
8. Test v1 directly with a query-string URL.
9. Run a small tester migration.
10. Point `index.html` to `v1.html` only after verification.

## First implementation milestone

The first code milestone will include:

- v2 state schema
- legacy migration
- complete reset
- export/import of engagement data
- no UI redesign yet

This establishes one reliable source of truth before visual features are moved.
