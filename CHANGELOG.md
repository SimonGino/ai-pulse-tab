# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [0.1.1] - 2026-03-13

### Fixed

- Fixed Claude usage parsing when `seven_day_sonnet.resets_at` is `null`.
- Prevented a single malformed quota window from dropping otherwise valid org usage data.
- Continued rendering usage when `resetAt` is missing by omitting the countdown instead of discarding the model window.
- Added a regression test for nullable Claude reset timestamps.

## [0.1.0] - 2026-03-12

### Added

- Initial release of AI Pulse Tab.
- Claude usage dashboard in the new tab page.
- Multi-organization Claude usage fetching and local caching.
- Retro pixel-art redesign with Pac-Man inspired visuals and quick links.
