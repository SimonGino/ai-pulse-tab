## ADDED Requirements

### Requirement: ClaudeProbe SHALL fetch organizations list
ClaudeProbe SHALL call `GET https://claude.ai/api/organizations` with `credentials: 'include'` to retrieve the user's organization list.

#### Scenario: User with multiple organizations
- **WHEN** the API returns an array with 2+ organizations (e.g., Personal + Team)
- **THEN** ClaudeProbe SHALL store all organizations and fetch usage for each

#### Scenario: API returns empty organizations
- **WHEN** the API returns an empty array
- **THEN** ClaudeProbe SHALL return `AuthStatus { status: 'expired' }` as this indicates an invalid session

### Requirement: ClaudeProbe SHALL fetch usage per organization
For each organization UUID, ClaudeProbe SHALL call `GET https://claude.ai/api/organizations/{orgId}/usage` to retrieve usage data.

#### Scenario: Successful usage fetch
- **WHEN** the usage API returns 200
- **THEN** ClaudeProbe SHALL parse the response using defensive optional chaining
- **AND** SHALL normalize data into the `UsageData` interface

#### Scenario: Unknown response format
- **WHEN** the usage API returns 200 but the response structure does not match expected schema
- **THEN** ClaudeProbe SHALL log the raw response to `chrome.storage.local` under a debug key
- **AND** SHALL return `null` instead of crashing

### Requirement: ClaudeProbe SHALL validate actual API response format
Before finalizing the parser, the actual response from `/api/organizations/{orgId}/usage` MUST be captured and documented. The parser SHALL be built against the real response structure, not the hypothetical format in the tech plan.

#### Scenario: Response format validation during development
- **WHEN** developer runs the PoC against a real Claude session
- **THEN** the raw JSON response SHALL be saved to `docs/claude-api-response-samples/` for reference
- **AND** a zod schema SHALL be derived from the actual response

### Requirement: UI SHALL display usage for all organizations
When a user has multiple organizations, the UI SHALL display usage data for each org, either as sub-cards within the Claude provider card or as separate cards.

#### Scenario: Two organizations with different usage levels
- **WHEN** user has "Personal" org at 65% session usage and "Team" org at 20% session usage
- **THEN** the UI SHALL show both orgs' usage clearly labeled with org names

### Requirement: ClaudeProbe SHALL fetch Extra Usage data when available
ClaudeProbe SHALL optionally call `GET https://claude.ai/api/organizations/{orgId}/overage_spend_limit` to retrieve Extra Usage (overage) spending data.

#### Scenario: User has Extra Usage enabled
- **WHEN** the overage API returns spending data
- **THEN** the UI SHALL display spent/limit amounts (e.g., "$5.20 / $100")

#### Scenario: User does not have Extra Usage
- **WHEN** the overage API returns 404 or empty data
- **THEN** the UI SHALL not display the Extra Usage section for that org
