# Privacy Policy for AI Pulse Tab

**Last updated: 2026-03-14**

## Overview

AI Pulse Tab is a Chrome extension that displays your AI service (Claude, ChatGPT) usage quotas on the new tab page. We are committed to protecting your privacy.

## Data Collection

**AI Pulse Tab does NOT collect, transmit, or share any personal data.**

## Data Usage

- **Authentication**: The extension makes authenticated requests to `claude.ai` and `chatgpt.com` to fetch your usage quotas. It relies on your existing browser sessions (via `credentials: 'include'`) and does not explicitly read, extract, store, or transmit any cookies.
- **Local Storage**: Usage data (quota percentages, reset times), custom bookmarks, and user preferences (e.g., search engine selection) are cached locally on your device using `chrome.storage.local`. This data never leaves your browser.
- **Alarms**: The extension uses `chrome.alarms` to periodically refresh usage data in the background (every 5 minutes). No data is sent externally.

## Third-Party Services

- The extension communicates only with `claude.ai` and `chatgpt.com` to retrieve your usage data. No other external services are contacted for data.
- The extension loads fonts from Google Fonts for UI styling. Google's privacy policy applies to font loading: https://policies.google.com/privacy

## Data Sharing

We do not sell, trade, or transfer any user data to third parties.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last updated" date above.

## Contact

If you have questions about this privacy policy, please open an issue at: https://github.com/SimonGino/ai-pulse-tab/issues
