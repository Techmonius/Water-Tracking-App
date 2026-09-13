# 1.9.5 stale upgrade protection

The installer previously used Cache.addAll with default HTTP caching. A new Cache Storage name does not guarantee fresh application files. Install requests now use cache: reload, and activation requires both the downloaded version marker and app configuration to match the worker release. Registration also disables HTTP-cache use for worker update checks.

Verified every one of the 42 production files in release 1.9.4 was reachable and byte-identical to the release. This rules out a persistently missing deployment asset at the time of inspection; it does not reproduce or explain the reported iPhone script-load error conclusively.

Regression validation simulates old 1.9.3 configuration arriving with a new version marker and verifies activation is rejected. Successful fresh installation and offline failed-install safety pass, along with full application validation. No hydration storage is cleared or migrated. Physical iPhone upgrade testing remains outstanding.
