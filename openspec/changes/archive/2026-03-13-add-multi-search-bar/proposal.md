## Why

新标签页是用户打开最频繁的页面，而搜索是最核心的使用场景之一。目前 AI Pulse Tab 只展示 AI 用量数据和书签，缺少搜索入口，用户仍需手动切换到搜索引擎或 AI 平台。添加一个内置的多引擎搜索栏，可以让用户直接在新标签页发起搜索，并快速切换 Google、Claude、ChatGPT、Gemini 等搜索/对话引擎，大幅提升使用效率。

## What Changes

- 在新标签页顶部区域新增一个搜索栏组件
- 默认搜索引擎为 Google，用户输入关键词后回车即跳转 Google 搜索结果页
- 搜索栏左侧/右侧提供引擎切换按钮，支持 Google、Claude、ChatGPT、Gemini 四个引擎
- 切换引擎后，搜索行为对应跳转到不同平台的搜索/对话页面：
  - Google → `https://www.google.com/search?q=...`
  - Claude → `https://claude.ai/new?q=...`
  - ChatGPT → `https://chatgpt.com/?q=...`
  - Gemini → `https://gemini.google.com/app?q=...`
- 用户选择的默认引擎偏好保存到 `chrome.storage.local`，跨会话记忆
- 搜索栏整体遵循现有的像素风格主题

## Capabilities

### New Capabilities
- `multi-search-bar`: 多引擎搜索栏组件，支持引擎切换、搜索跳转、偏好持久化

### Modified Capabilities
- `dashboard-layout`: 新标签页布局需要在顶部区域为搜索栏预留空间

## Impact

- **UI 组件**: 新增 `SearchBar.tsx` 组件及相关子组件（引擎选择器）
- **布局调整**: `App.tsx` 需在顶部插入搜索栏，可能影响现有 provider cards 和 bookmarks 的布局排列
- **存储**: `chrome.storage.local` 新增 `preferredSearchEngine` 键
- **样式**: 需新增搜索栏相关的像素风格 CSS，与现有 `pixel-theme` 保持一致
- **无新依赖**: 纯前端实现，不需要额外 npm 包
