## ADDED Requirements

### Requirement: Probe SHALL use credentials include for authentication
All Probe implementations SHALL use `fetch(url, { credentials: 'include' })` to authenticate API requests. Manual `Cookie` header construction is forbidden in MV3 Service Workers.

#### Scenario: Claude API request with browser cookie
- **WHEN** ClaudeProbe calls `fetch('https://claude.ai/api/organizations', { credentials: 'include' })`
- **THEN** the browser SHALL automatically attach all claude.ai cookies including `sessionKey`
- **AND** the API SHALL return 200 with organization data

#### Scenario: Request without host_permissions
- **WHEN** a Probe attempts `credentials: 'include'` to a domain not in `host_permissions`
- **THEN** the browser SHALL NOT attach cookies (CORS restriction)
- **AND** the Probe SHALL detect the auth failure and return `{ status: 'not_logged_in' }`

### Requirement: Manifest SHALL declare host_permissions for each provider domain
Each supported provider's domain MUST be listed in `host_permissions` to enable `credentials: 'include'`.

#### Scenario: Minimum host_permissions for Phase 1
- **WHEN** the extension is installed
- **THEN** manifest.json SHALL contain `host_permissions` for at least `https://claude.ai/*`

### Requirement: Auth fallback when credentials include fails
If `credentials: 'include'` returns 401/403, the Probe SHALL fall back to prompting the user for a manual OAuth token.

#### Scenario: Expired session cookie
- **WHEN** ClaudeProbe fetch returns 401 or 403
- **THEN** the Probe SHALL return `AuthStatus { status: 'expired', message: '请重新登录 claude.ai' }`
- **AND** the UI SHALL display a re-login prompt with a direct link to claude.ai
