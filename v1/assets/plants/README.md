# Plant artwork standard

Production artwork stays raster. Sunflower, Monstera, Lavender, Strawberry, Cactus, Cherry Blossom Bonsai, and Pothos use the user's original JPEG sources in `approved/`, rendered through inline SVG clipping masks. SVG supplies clipping geometry; it does not redraw or vectorize the art.

- `scripts/build-artwork-masks.py` builds `v1/js/artwork.js` from the approved source images.
- Each stage has a bounded crop, a shared ground line within its species, and a mask that removes light page backgrounds while retaining dark subject pixels.
- Animated flower layers use the same source, coordinate space and ground line as their base.
- The main card and both garden views use `WT_V1_PLANTS.artMarkup/artElement`.
- Starter Flower retains its raster files, with display clipping for the detached stage-7 line and flower-only overlays.
- Never embed raster bytes in production JavaScript, redraw approved art, or use file existence as evidence of visual correctness.
- Every production source must be precached. Version/cache numbers change together.
- Run both validators and inspect every active stage/overlay composition before claiming a complete sprite audit.

See `SPRITE-AUDIT-1.9.2.md` for findings, previews, source provenance and verification limits.

## Plants 4–8 (release 1.9.7)

The five newly enabled species reuse the **existing approved Plants 3–8 JPEG**. Their 40 stage crop masks are in `v1/js/artwork-extra.js`. Mask rows are encoded losslessly as a count and (x,width) byte pairs, base64 for safe JavaScript transport. `WT_V1_PLANTS.artMarkup` expands only the requested stage into crisp one-pixel SVG clipping rectangles; original source colors remain JPEG pixels.

Every stage has a common pot baseline per species. The concept board has an extra intermediate cactus and pothos drawing; those extra unlabeled versions are omitted so the app has exactly eight stages (including Seed). The moisture filters, 0/3/6/10 small and large droplets, existing Starter Flower/Sunflower/Monstera art, and Mystery Seed history remain unchanged. Lavender/cactus blossom regions pulse, red strawberry regions pulse, bonsai petals drift independently, and late pothos leaf clusters sway. Reduced-motion preferences are respected.

Source JPEG SHA-256: `b60936f5fe5b61da41322ba2b6662546b739c5ede3e1c2485c5c7075817523ca`. The approved image is already in `approved/plants-3-8.jpeg`; no duplicate JPEG was added.
