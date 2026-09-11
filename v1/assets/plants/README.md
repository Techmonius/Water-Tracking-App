# Plant artwork standard

Production artwork stays raster. Sunflower and Monstera use the user's original JPEG sources in `approved/`, rendered through inline SVG clipping masks. SVG supplies clipping geometry; it does not redraw or vectorize the art.

- `scripts/build-artwork-masks.py` builds `v1/js/artwork.js` from the approved source images.
- Each stage has a bounded crop, a shared ground line within its species, and a mask that removes light page backgrounds while retaining dark subject pixels.
- Animated flower layers use the same source, coordinate space and ground line as their base.
- The main card and both garden views use `WT_V1_PLANTS.artMarkup/artElement`.
- Starter Flower retains its raster files, with display clipping for the detached stage-7 line and flower-only overlays.
- Never embed raster bytes in production JavaScript, redraw approved art, or use file existence as evidence of visual correctness.
- Every production source must be precached. Version/cache numbers change together.
- Run both validators and inspect every active stage/overlay composition before claiming a complete sprite audit.

See `SPRITE-AUDIT-1.9.2.md` for findings, previews, source provenance and verification limits.
