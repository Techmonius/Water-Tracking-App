# 1.9.4 automatic updates

Restores automatic worker activation after the entire release is cached. Version 1.9.1 had deliberately required manual activation, which changed the expected opening behavior. The app now checks for a worker update on page opening and foreground resume, and activates an already waiting release.

Adds a page-side reload fallback on controller replacement. The Update button also reloads after activation or when the new worker is already active. Legacy clients still receive worker-side navigation. Failed downloads cannot activate an incomplete release; offline users keep the installed version.

Validation covers opening, foreground resume, waiting-worker activation, controller-change reload fallback, manual reload with no waiting worker, and failed/successful worker installation. Full application validation passes. Installed iPhone PWA behavior has not been tested on a physical device.
