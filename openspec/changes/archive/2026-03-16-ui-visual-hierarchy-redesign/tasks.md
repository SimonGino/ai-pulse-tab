## 1. 样式与主题清理

- [x] 1.1 更新 `style.css` 中 CSS 变量：删除 `--pixel-yellow`、`--pixel-pink`；`--pixel-cyan` 保留定义但不再用于 UI 强调
- [x] 1.2 将搜索栏相关样式中所有 `var(--pixel-cyan)` 替换为灰度色（`.search-engine-btn`、`.search-engine-option-active`、`.search-engine-option-icon`、`.search-suggestion-active`）
- [x] 1.3 删除 `PacmanDecoration.css` 文件

## 2. 组件删除

- [x] 2.1 删除 `components/PacmanDecoration.tsx`
- [x] 2.2 从 `App.tsx` 中移除 `PacmanDecoration` 的 import 和渲染

## 3. 布局重排

- [x] 3.1 重构 `App.tsx` 布局顺序：已登录时渲染 Quota Cards → Search → Bookmarks；未登录时渲染 Search → 未登录提示 → Bookmarks
- [x] 3.2 移除或极淡化 "AI Pulse Tab" 标题
- [x] 3.3 调整 footer 区域（刷新按钮 + 更新时间）位于 quota 区域下方

## 4. Provider 卡片去色

- [x] 4.1 `ProviderCard.tsx` 中 provider 名称颜色从品牌色（amber/teal）改为 `--pixel-white`
- [x] 4.2 Provider 卡片左侧指示色块从品牌色改为灰色或移除

## 5. 搜索栏去色

- [x] 5.1 `SearchBar.tsx` 中搜索引擎选择器文字颜色从 cyan 改为灰度色

## 6. 书签 Favicon 改造

- [x] 6.1 更新 `Bookmark` 类型（`core/types.ts`）：`letter` 和 `color` 改为 optional
- [x] 6.2 更新 `core/constants.ts`：简化 `DEFAULT_BOOKMARKS`（移除 color 和 letter）、删除 `BOOKMARK_COLORS`
- [x] 6.3 重构 `BookmarkGrid.tsx`：卡片从彩色大字母改为 favicon + 灰色文字标签的紧凑布局
- [x] 6.4 实现 favicon 获取逻辑：从 URL 提取域名，通过 Google Favicon 服务获取图标，onerror 时 fallback 到首字母
- [x] 6.5 重构 `BookmarkModal.tsx`：移除颜色选择器和字母输入，仅保留 name 和 URL 字段
- [x] 6.6 更新书签悬停效果：从彩色高亮改为灰色高亮

## 7. Section Header 去色

- [x] 7.1 `BookmarkGrid.tsx` 中 "BOOKMARKS" header 颜色从 cyan 改为 `--pixel-gray`
- [x] 7.2 `App.tsx` 中 "USAGES" header 颜色从 cyan 改为 `--pixel-gray`

## 8. 验证与清理

- [x] 8.1 构建项目确保无编译错误
- [ ] 8.2 手动验证已登录状态布局：quota 在顶部、搜索栏在中间、书签在底部
- [ ] 8.3 手动验证未登录状态布局：搜索栏在顶部
- [x] 8.4 验证页面无饱和色残留（除 quota bar 的 green/orange/red 外）
- [ ] 8.5 验证书签 favicon 加载和 fallback 逻辑
