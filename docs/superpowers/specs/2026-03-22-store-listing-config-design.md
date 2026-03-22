# Store Listing Configuration Design

## Overview

Create a Markdown file at `docs/store/STORE_LISTING.md` to serve as the single source of truth for all Chrome Web Store listing fields. This file is referenced and updated before each store submission to ensure descriptions match current features and pass review.

## Problem

Chrome Web Store requires accurate descriptions of extension features and permission justifications. When code changes add new features (e.g., todo list, theme toggle, inline editing), the store listing must be updated accordingly — otherwise the review gets rejected. Currently these fields are only maintained in the Chrome Web Store Dashboard UI, with no local reference copy.

## Solution

A single Markdown file organized by Dashboard page sections, containing all fields that need to be filled in or verified during each submission.

### File Location

`docs/store/STORE_LISTING.md` — alongside existing store assets (screenshots, promo images).

### Structure

Four sections matching the Chrome Web Store Dashboard pages:

1. **商品详情 (Product Details)**
   - Title — synced from manifest, annotated as such
   - Summary — synced from manifest, annotated as such
   - Description — full text, directly copy-pasteable
   - Category — "Tools"
   - Language — "English (US)"

2. **图片资源 (Image Assets)**
   - Store icon — spec + file path (`public/icon/128.png`)
   - Screenshots — spec + relative file paths in `docs/store/`
   - Small promo tile — spec + file path
   - Marquee promo tile — spec + file path
   - Promo video — YouTube URL (optional)

3. **其他字段 (Other Fields)**
   - Official website
   - Homepage URL
   - Support page URL

4. **隐私权 (Privacy)**
   - Single purpose statement
   - Permission justifications — one subsection per permission (storage, alarms, host permissions)
   - Remote code declaration

### Design Decisions

- **Markdown format**: Best readability for a reference document, easy to edit and review in git diffs.
- **Dashboard-aligned sections**: The primary use case is "open Dashboard → open this file → check each field", so mirroring the Dashboard structure is most intuitive.
- **Manifest sync annotations**: Title and summary come from `wxt.config.ts` → manifest.json. Annotating these fields reminds maintainers to keep them in sync.
- **Inline full text**: Description and permission justifications are written as full text blocks (not abbreviated), so they can be directly copied into Dashboard input fields.
- **Relative file paths for assets**: Screenshot and promo image paths point to actual files in the repo for easy verification.

### Content Updates Needed

The current store description is missing recently added features:
- Todo list with priority levels
- Dark/Light/System theme toggle
- Inline editing for todo items (double-click)
- Greeting header with time-based messages

These should be reflected in the description when creating the file.

## Scope

- Create one file: `docs/store/STORE_LISTING.md`
- Pre-fill with current content from the Chrome Web Store Dashboard
- Update the description text to include new features
- No scripts, no automation, no build integration
