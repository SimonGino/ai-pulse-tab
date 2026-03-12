## ADDED Requirements

### Requirement: Each Probe SHALL have unit tests with mocked API responses
Probe tests SHALL NOT depend on real cookies or live API calls. All external dependencies (chrome.cookies, fetch) SHALL be mocked.

#### Scenario: ClaudeProbe unit test with mocked fetch
- **WHEN** test mocks `fetch` to return a sample organizations response
- **THEN** `ClaudeProbe.fetchUsage()` SHALL return a correctly normalized `UsageData` object

#### Scenario: ClaudeProbe handles API error
- **WHEN** test mocks `fetch` to return 500
- **THEN** `ClaudeProbe.fetchUsage()` SHALL return `null` without throwing

### Requirement: Response parser SHALL have snapshot tests against real API samples
Each Probe's parser SHALL be tested against saved real API response samples stored in `tests/fixtures/`.

#### Scenario: Claude usage response parsing
- **WHEN** parser receives a saved real response from `tests/fixtures/claude-usage-response.json`
- **THEN** it SHALL produce the expected `UsageData` output matching a snapshot

### Requirement: UI components SHALL have component tests
Key UI components (ProviderCard, QuotaBar, ResetCountdown) SHALL have component tests using a React testing library.

#### Scenario: QuotaBar renders correct width
- **WHEN** QuotaBar receives `used: 0.65`
- **THEN** the progress bar element SHALL have width style of `65%`

#### Scenario: QuotaBar color thresholds
- **WHEN** QuotaBar receives `used: 0.85`
- **THEN** the progress bar SHALL apply the red/warning color class

### Requirement: CI SHALL run tests without browser or real credentials
The test suite MUST be runnable in CI (GitHub Actions) without a Chrome browser instance or real session cookies.

#### Scenario: CI test execution
- **WHEN** `npm test` is executed in CI
- **THEN** all unit and component tests SHALL pass
- **AND** chrome API calls SHALL be mocked via a test setup file

### Requirement: Project SHALL use Vitest as the test runner
Vitest SHALL be used for unit and component tests, consistent with the Vite/WXT toolchain.

#### Scenario: Test configuration
- **WHEN** developer runs `vitest`
- **THEN** it SHALL discover and run all `*.test.ts` and `*.test.tsx` files under `src/` and `tests/`

### Requirement: Storage schema migration SHALL have tests
Each migration function SHALL be tested to ensure it correctly transforms data from version N to N+1.

#### Scenario: Migration from v0 to v1
- **WHEN** storage contains data without `schemaVersion` field
- **THEN** migration SHALL add `schemaVersion: 1` and transform data structure as needed
