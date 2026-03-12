## ADDED Requirements

### Requirement: Project SHALL use WXT as the extension framework
The project SHALL use WXT (wxt.dev) instead of CRXJS as the Chrome Extension build framework. WXT provides Vite 6 compatibility, native MV3 support, and file-based entrypoints.

#### Scenario: Development server with HMR
- **WHEN** developer runs `wxt dev`
- **THEN** the extension SHALL load in Chrome with hot module replacement enabled for newtab, background, and options pages

#### Scenario: Production build
- **WHEN** developer runs `wxt build`
- **THEN** the output SHALL be a valid MV3 Chrome Extension in `.output/chrome-mv3/`
- **AND** the manifest.json SHALL contain correct permissions, host_permissions, and entrypoints

### Requirement: Project structure SHALL follow WXT file-based entrypoints
Entrypoints SHALL be organized under `src/entrypoints/` following WXT conventions. Domain logic (`core/`) and probes (`probes/`) SHALL remain as separate directories outside entrypoints.

#### Scenario: Entrypoint discovery
- **WHEN** WXT scans `src/entrypoints/`
- **THEN** it SHALL discover `background.ts`, `newtab/index.html`, and `options/index.html` as valid entrypoints

### Requirement: Tech stack SHALL be React 19 + TypeScript + Tailwind CSS 4
The UI layer SHALL use React 19 with TypeScript. Styling SHALL use Tailwind CSS 4. No additional state management library (e.g., Zustand) SHALL be included in Phase 1.

#### Scenario: New Tab page renders
- **WHEN** user opens a new tab
- **THEN** the React app SHALL mount and render provider cards styled with Tailwind CSS
