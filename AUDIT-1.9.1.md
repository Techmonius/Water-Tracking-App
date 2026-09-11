# Water Tracker 1.9.1 engineering audit

Reviewed against production commit `2b8f14e` (1.9.0). Release date: 2026-09-11.

## Findings fixed

| Priority | Finding | Resolution |
| --- | --- | --- |
| High | Monstera stages 1 and 8 were corrupt PNGs; stages 2 and 3 declared incorrect image dimensions. Existence-only tests missed all four. | Stage 1 end chunk repaired; stages 2/3 headers corrected to the 128×128 dimensions of their existing pixel streams. Stage 8 replaced through image editing using the approved Monstera sprite sheet as reference. This last asset is a derived replacement, not an exact binary restoration. Added PNG chunk CRC, decompression, row-length/filter and WebP container checks. |
| High | Full Bloom flower overlay 4 also failed WebP decoding. | Replaced its corrupt stream with a self-contained SVG crop of the intact original Full Bloom artwork, using the existing renderer crop bounds. |
| High | Long-lived hydration APIs could overwrite changes made since their initial load. | Refresh stored state immediately before each mutation; refresh UI on storage/focus/visibility events. Added stale-API regression tests. This reduces stale-state loss; it is not a cross-tab transaction lock. |
| High | The plant artwork was absent from the service worker's required offline shell. | Precache plant stages and overlays before a worker can install successfully. |
| Medium | Update clicked through after 2.5 seconds, even when the new worker was still downloading. | Wait for a waiting worker and controller activation, with an explicit retry message on timeout. Restore user-triggered activation after the 1.9.0 recovery release. |
| Medium | Date-dependent UI could remain on yesterday until another interaction. | Refresh on resume/focus and check for a date change every 30 seconds. |
| Medium | A failed save left mutated drinks in the API's memory. | Roll back unsuccessful mutations; regression test simulates storage failure. |
| Medium | Export used a potentially stale state snapshot, including plant progress. | Export the current persisted state. |
| Medium | Imported labels/IDs and badge counts could reach HTML without escaping. | Escape statistics values, drink IDs, badge counts and developer values. |
| Medium | Invalid calendar dates could be silently discarded on normalization after a drink was added. | Reject malformed/nonexistent dates in the mutation layer. |
| Low | Production files were mostly compressed single-line code, making review and maintenance harder. | Format production JS, CSS and HTML into readable source. |

## Sprite behavior

- Existing plant lifecycle thresholds and flower animations retained.
- Monstera stays static; hydration droplets are renderer effects.
- Both droplet sizes retain counts of 0/3/6/10 for dry/damp/moist/watered.
- Large droplets remain three times the small droplets' width and height at both CSS breakpoints.
- All four moisture filters and reduced-motion styles remain.
- Stage 8 replacement prompt: extract the final-stage Monstera from the approved sheet, preserve its design, remove checkerboard/labels/sparkles, and provide a transparent centered sprite. Built-in image editing was used; no other plants were regenerated.

## Validation and limits

Run `node scripts/validate.mjs` with Node 22.15+ or 24. The existing GitHub Actions job runs this command.

Checks cover JavaScript syntax, references, version alignment, asset integrity, migrations, import/settings validation, streaks, plant completion/handoff, droplet counts, undo through empty history, reset/restore, stale APIs, invalid dates and failed saves. Service-worker tests execute the production worker with in-memory Cache/Client APIs, including failed installation, explicit activation, scoped cache deletion, offline shell/artwork retrieval, and version requests.

Direct file decoding is also checked with `python scripts/validate-images.py` (Pillow required), both locally and in GitHub Actions. Browser access to the local preview was rejected by automatic approval review. No end-to-end browser, iPhone Safari, installed-PWA update, or visual animation verification is claimed. Service-worker simulations are not a substitute for those device checks.

## Recommended next work

1. **Real-device regression coverage:** verify an installed 1.9.0 → 1.9.1 update, overnight resume, airplane-mode plants, and undo on iPhone Safari. Add a repeatable browser suite when preview access is available.
2. **Cross-tab serialization:** use a serialized write strategy (such as Web Locks with an appropriate fallback, or IndexedDB transactions) if simultaneous tabs become a real usage pattern. Refresh-before-write cannot prevent two truly simultaneous writes.
3. **Historical goal semantics:** goals are currently evaluated using current settings, so changing a goal recalculates old goal days/streaks and plant progress. Decide whether historical days should retain their original target before changing the data schema.
4. **Render efficiency:** calculate statistics once per update and reuse the result; avoid rebuilding all history/badge sections and plant DOM on every small change. Current modules repeatedly scan history.
5. **State validation and recovery:** strengthen import validation of engagement/plant records, and provide a recoverable UI for malformed storage. Current storage correctly avoids overwriting corrupt or newer-schema data, but startup can stop without a friendly recovery screen.
6. **Birthday prompt:** make dismissal persist, so an optional birthday does not reopen Settings on every launch.
7. **Telemetry:** review whether exact birthday and automatic reporting are necessary. This release preserves the existing documented behavior; it does not expand collection.
8. **Compatibility entry points:** keep old redirect URLs working; remove remaining unused assets only after checking historical clients and references.

A framework rewrite is not justified for this app. The current domain/module split is sufficient; prioritize data correctness and device tests over adding dependencies.
