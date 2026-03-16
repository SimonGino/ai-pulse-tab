## Why

当前书签点击行为使用 `target="_blank"` 在新标签页中打开链接。但作为新标签页扩展（chrome_url_overrides.newtab），用户打开新标签页的意图就是要导航到某个网站，标准的新标签页行为（如 Chrome 默认新标签页）应该是在当前标签页中打开链接，而不是再开一个新标签页。当前行为导致每次点击书签都会多出一个空白的新标签页，体验不佳。

## What Changes

- 书签点击从 `target="_blank"`（新标签页打开）改为在当前标签页中打开（`window.location.href`）
- 搜索跳转从 `window.open(url, '_blank')` 改为在当前标签页中导航
- 保留 Provider 登录链接的 `target="_blank"` 行为（登录页适合在新标签页打开，避免丢失当前页面状态）

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

- `quick-links`: 书签链接的打开方式从新标签页改为当前标签页

## Impact

- 受影响文件：`components/BookmarkGrid.tsx`、`components/SearchBar.tsx`
- 无 API 或依赖变更
- 用户行为变化：点击书签/搜索后当前标签页直接导航，不再保留新标签页
