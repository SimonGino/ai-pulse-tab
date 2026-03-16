## Context

AI Pulse Tab 是一个浏览器新标签页扩展，通过 `chrome_url_overrides.newtab` 替换默认新标签页。当前书签和搜索链接均使用 `target="_blank"` 或 `window.open(url, '_blank')` 在新标签页中打开，这与标准新标签页的交互习惯不一致。

当前实现位置：
- `components/BookmarkGrid.tsx`：书签使用 `<a href={url} target="_blank">` 渲染
- `components/SearchBar.tsx`：搜索使用 `window.open(url, '_blank')` 跳转

## Goals / Non-Goals

**Goals:**
- 书签点击在当前标签页中导航，符合标准新标签页行为
- 搜索跳转在当前标签页中导航，保持一致性

**Non-Goals:**
- 不修改 ProviderCard 登录链接的打开方式（登录流程适合在新标签页中进行）
- 不添加用户可配置的"在新标签页/当前标签页打开"选项

## Decisions

### 决策 1：使用 `window.location.href` 替代 `target="_blank"`

**选择**：将书签的 `<a target="_blank">` 改为点击事件处理，使用 `window.location.href = url` 导航。

**原因**：
- `window.location.href` 是最简单直接的当前标签页导航方式
- 与 Chrome 默认新标签页的行为一致
- 备选方案 `window.location.assign(url)` 效果相同但更冗长

### 决策 2：搜索跳转同步修改

**选择**：将 SearchBar 的 `window.open(url, '_blank')` 也改为 `window.location.href`。

**原因**：书签和搜索是新标签页的两个主要导航入口，行为应保持一致。

## Risks / Trade-offs

- **[用户习惯变化]** → 用户已习惯当前行为的可通过 Ctrl/Cmd+Click 在新标签页中打开链接，浏览器原生支持此行为
- **[页面状态丢失]** → 当前标签页导航后新标签页内容会被替换，但这正是新标签页的预期行为——用户打开新标签页就是为了导航到目标网站
