## Why

专业 UX 审查反馈：页面元素视觉权重接近，缺乏明确的视觉焦点；同时使用了 10+ 种饱和色，导致信息层级扁平、颜色噪音高。作为 "AI Pulse Tab"，核心价值是一眼看到 AI 用量——当前 quota 数据却被埋在搜索栏和书签下方，且与大量彩色元素竞争注意力。

## What Changes

- **布局重排**：将 quota 用量卡片从页面第四层提升到最顶部，搜索栏和书签下移
- **颜色大幅收敛**：页面唯一饱和色为 quota bar 的 green/orange/red 状态色；其余所有元素（搜索栏、书签、section header、provider 名称）退回灰度体系
- **书签改为 favicon 风格**：删除 80px 彩色大字母卡片，改用 favicon + 灰色文字标签的紧凑行
- **删除 Pac-Man 装饰**：移除底部动画装饰组件及相关样式
- **未登录自适应布局**：当无任何 provider 数据时，搜索栏自动升到页面顶部
- **删除或极淡化 "AI Pulse Tab" 标题**

## Capabilities

### New Capabilities
- `favicon-bookmarks`: 书签使用 favicon 图标展示，通过 Google favicon 服务获取，加载失败时 fallback 到灰色首字母

### Modified Capabilities
- `dashboard-layout`: 布局顺序从 Title→Search→Bookmarks→Quota 改为 Quota→Search→Bookmarks；未登录时搜索栏升顶
- `pixel-theme`: 颜色体系从多饱和色改为灰度为主 + quota 状态色为唯一彩色；删除 Pac-Man 装饰相关样式
- `custom-bookmarks`: 书签视觉从彩色字母卡片改为 favicon + 灰色文字；BookmarkModal 移除颜色选择器和字母输入

## Impact

- **组件删除**：`PacmanDecoration.tsx`、`PacmanDecoration.css`
- **组件重构**：`App.tsx`（布局顺序）、`BookmarkGrid.tsx`（favicon 风格）、`BookmarkModal.tsx`（简化表单）、`ProviderCard.tsx`（去色）、`SearchBar.tsx`（去色）
- **样式重构**：`style.css`（CSS 变量简化、删除 Pac-Man 样式）
- **数据模型**：`Bookmark` 类型的 `letter`/`color` 字段变为可选（向后兼容已有书签数据）
- **常量**：`BOOKMARK_COLORS` 可删除、`DEFAULT_BOOKMARKS` 简化
- **外部依赖**：新增对 Google favicon 服务的网络请求（`https://www.google.com/s2/favicons?domain=xxx&sz=32`）
