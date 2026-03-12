# Claude API Response Samples

This directory stores real API response JSON from the PoC extension, used to build accurate parsers.

## How to capture

1. Load the PoC extension from `poc-mv3-cookie/` in Chrome (chrome://extensions → Developer mode → Load unpacked)
2. Make sure you're logged in to claude.ai (and optionally chatgpt.com)
3. Click the extension popup → "获取 Claude Usage (真实响应)"
4. Copy the JSON output and save to files in this directory:
   - `organizations.json` — Response from `/api/organizations`
   - `usage-{orgName}.json` — Response from `/api/organizations/{orgId}/usage`
   - `overage-{orgName}.json` — Response from `/api/organizations/{orgId}/overage_spend_limit`

## For ChatGPT

1. Click "测试 ChatGPT credentials:include" in the popup
2. Save response to `chatgpt-accounts-check.json`
