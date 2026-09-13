# 1.9.3 sprite edge correction

The 1.9.2 source masks retained pale JPEG edge pixels and the cream-colored ground fringe. The mask builder now removes neutral/light pixels connected to the crop exterior, in addition to the existing paper-background exclusion. This applies to all eight Sunflower stages, all eight Monstera stages, and the three Sunflower flower layers. Approved raster files are unchanged.

SVG clip paths now use crisp edges across base sprites, garden previews, and flower overlays. The eight Starter Flower stages and four separate WebP flower overlays have binary alpha already; their dark outlines are retained.

Validation: inspected all 16 revised source-mask stage previews against a dark background and reviewed the eight Starter Flower stage previews. All 14 production rasters decode, the application/service-worker validation passes, and the sunflower sprout interior regression points remain opaque. The flower masks use the same background removal as their base sprites. Real-device rendering and animation remain unverified.
