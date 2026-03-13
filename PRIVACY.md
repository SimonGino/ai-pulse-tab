# Privacy Policy for AI Pulse Tab

**Last updated: 2026-03-13**

## Overview

AI Pulse Tab is a Chrome extension that displays your Claude AI usage quota on the new tab page. We are committed to protecting your privacy.

## Data Collection

**AI Pulse Tab does NOT collect, transmit, or share any personal data.**

## Data Usage

- **Cookies**: The extension reads your `claude.ai` login cookie locally to authenticate API requests for fetching your usage quota. This cookie is never transmitted to any third-party server.
- **Local Storage**: Usage data (quota percentages, reset times) is cached locally on your device using `chrome.storage.local` to reduce unnecessary network requests. This data never leaves your browser.
- **Alarms**: The extension uses `chrome.alarms` to periodically refresh usage data in the background. No data is sent externally.

## Third-Party Services

- The extension communicates only with `claude.ai` to retrieve your usage data.
- The extension loads the "Press Start 2P" font from Google Fonts. Google's privacy policy applies to font loading: https://policies.google.com/privacy

## Data Sharing

We do not sell, trade, or transfer any user data to third parties.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last updated" date above.

## Contact

If you have questions about this privacy policy, please open an issue at: https://github.com/SimonGino/ai-pulse-tab/issues
