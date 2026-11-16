# Water Tracker 1.9.7 — five new growth species

Added Lavender (38 goal days), Strawberry (42), Cactus (36), Cherry Blossom Bonsai (45), and Pothos / Devil's Ivy (38), each with eight growth stages and source-preserving pixel art cropped from the approved Plants 3–8 reference sheet. Existing species and user progress are unchanged.

Mystery Seeds include the new species in the existing random selection pool. Plants progress only from earned hydration goal days, not elapsed calendar days. Existing completed-plant garden cards show the final new artwork automatically; no saved data migration required.

Blossom animation is limited to Lavender and Cactus flower regions (stages 6–8). Strawberry fruit colors pulse (stages 7–8). Cherry blossom bonsai petals drift (stages 6–8). Late Pothos foliage softly sways (stages 7–8). Whole plants and pots do not animate. Existing 4 moisture filters and both droplet size sets remain intact; reduced motion is honored.

Production code: `v1/js/artwork-extra.js`, `v1/js/plants.js`, `v1/js/pixel-plant.js`, `v1/css/pixel-plant.css`. Version, cache and references advanced together to 1.9.7. No changes to tracking, birthdays, or Sheets backend.

Verification: app validator should check all 40 added stages, asset availability, packed-mask decoding, progression thresholds, and existing hydration regression tests. No physical iPhone or live PWA upgrade is verified solely by this code change.
