## ADDED Requirements

### Requirement: ChatGPT Probe SHALL be fully designed before implementation
The ChatGPT Probe MUST have the same level of design detail as Claude Probe — including verified API endpoints, response format samples, authentication method, and parser specification — before coding begins.

#### Scenario: Design document completeness check
- **WHEN** ChatGPT Probe design is reviewed
- **THEN** it SHALL include: (1) verified API endpoint(s), (2) real response JSON sample, (3) authentication method, (4) zod schema for response parsing, (5) fallback strategy

### Requirement: ChatGPT Probe SHALL use credentials include for chatgpt.com
ChatGPT Probe SHALL authenticate using `fetch(url, { credentials: 'include' })` with `host_permissions` for `https://chatgpt.com/*`.

#### Scenario: PoC verification for ChatGPT
- **WHEN** a PoC extension calls `fetch('https://chatgpt.com/backend-api/accounts/check', { credentials: 'include' })`
- **THEN** the response SHALL be captured to verify if this endpoint returns plan type and usage cap data

### Requirement: ChatGPT Probe SHALL use accounts check endpoint as primary source
Based on community research, `GET https://chatgpt.com/backend-api/accounts/check/v4-2023-04-27` is the most likely endpoint for plan/usage data. The Probe SHALL use this as the primary endpoint.

#### Scenario: Successful accounts check
- **WHEN** the endpoint returns 200 with account data
- **THEN** the Probe SHALL extract `plan_type`, rate limit metadata, and entitlements
- **AND** normalize them into the `UsageData` interface

#### Scenario: Endpoint path changes
- **WHEN** the accounts/check endpoint returns 404
- **THEN** the Probe SHALL attempt known alternative paths (e.g., `/backend-api/me`)
- **AND** SHALL log the failure for debugging

### Requirement: ChatGPT Probe SHALL handle rate-limit-only data model
ChatGPT may not expose percentage-based usage like Claude. Instead, it may expose message counts and reset times. The Probe SHALL map this into the `UsageData` model using message count / cap as the percentage.

#### Scenario: Message-count-based usage
- **WHEN** the API returns `messages_used: 30, messages_cap: 80, reset_at: "..."`
- **THEN** the Probe SHALL compute `used = 30/80 = 0.375` and populate `QuotaWindow` accordingly
