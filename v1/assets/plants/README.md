# Plant asset standard

Plant 1 is the rendering and behavior reference and its proven artwork should not be reworked just to change formats. Plants 2 and later use the clean asset layout below.

## Folder layout

- Base stages: `v1/assets/plants/<plant-id>/stage-1.png` through `stage-8.png`
- Animated parts only: `v1/assets/plants/<plant-id>/overlays/stage-<n>-<part>.png`

## Rules

1. Extract from approved concept art without redrawing or vectorizing it.
2. Keep every base stage as a complete, static raster sprite.
3. Use transparent raster overlays containing only the pixels intended to animate.
4. Pot, soil, stems, and non-animated foliage stay in the base sprite.
5. Moisture filters and water droplets remain renderer-level effects.
6. Never embed production image data in JavaScript.
7. Add all new raster assets to the service-worker cache and bump app/cache versions together.
8. Prepare a complete plant update before publishing it; avoid intermediate production states.
