## 1. 数据层：书签模型与存储

- [x] 1.1 在 `core/types.ts` 中定义 `Bookmark` 接口（id, name, url, letter, color, order）
- [x] 1.2 在 `core/constants.ts` 中添加 `STORAGE_KEYS.bookmarks` 和 `DEFAULT_BOOKMARKS` 默认书签列表
- [x] 1.3 在 `core/constants.ts` 中添加 `BOOKMARK_COLORS` 预设颜色板（至少 8 种与像素主题协调的颜色）

## 2. 书签管理 Hook

- [x] 2.1 创建 `hooks/useBookmarks.ts`，实现从 `browser.storage.local` 读取书签数据
- [x] 2.2 实现首次初始化逻辑：检测 `bookmarks` 键不存在时写入默认书签
- [x] 2.3 实现添加书签功能（生成 id、自动提取首字母、分配默认颜色、设置 order）
- [x] 2.4 实现编辑书签功能（更新 name、url、letter、color）
- [x] 2.5 实现删除书签功能（移除并持久化）

## 3. 书签 UI 组件

- [x] 3.1 重写 `components/QuickLinks.tsx` 为 `components/BookmarkGrid.tsx`，使用 `useBookmarks` hook 动态渲染书签
- [x] 3.2 实现自适应网格布局（`grid-template-columns: repeat(auto-fill, minmax(80px, 1fr))`）
- [x] 3.3 在书签网格末尾添加像素风格的"+"添加按钮（虚线边框区分）
- [x] 3.4 实现书签卡片右键上下文菜单（像素风格，包含"编辑"和"删除"选项）

## 4. 书签编辑 Modal

- [x] 4.1 创建 `components/BookmarkModal.tsx` 像素风格 Modal 组件（遮罩 + 居中弹窗）
- [x] 4.2 实现 Modal 表单：名称输入框（必填）、URL 输入框（必填）、字母图标预览、颜色选择器
- [x] 4.3 实现表单验证：名称和 URL 为空时显示错误提示
- [x] 4.4 实现删除确认弹窗逻辑

## 5. Provider 卡片折叠

- [x] 5.1 在 `core/constants.ts` 中添加 `STORAGE_KEYS.collapsedProviders` 存储键
- [x] 5.2 在 `components/ProviderCard.tsx` 中添加折叠/展开状态和像素风格箭头按钮
- [x] 5.3 实现折叠状态：只显示 Provider 名称 + 最高用量百分比概要
- [x] 5.4 实现折叠状态持久化（读写 `browser.storage.local`）

## 6. 响应式仪表盘布局

- [x] 6.1 重构 `App.tsx` 布局：使用 CSS Grid 替代 flex-col，定义双列网格区域
- [x] 6.2 实现响应式断点：≥1024px 双列（左 Provider 右书签），<1024px 单列
- [x] 6.3 调整内容区域最大宽度和居中策略，适配超宽屏
- [x] 6.4 更新标题和底部工具栏（刷新按钮、最后更新时间）的位置，适配新布局

## 7. 样式与主题适配

- [x] 7.1 为书签 Modal、上下文菜单、添加按钮添加像素风格 CSS（边框、字体、颜色）
- [x] 7.2 确保所有新增 UI 元素使用像素主题 CSS 变量（--pixel-dark, --pixel-border 等）
- [x] 7.3 验证 PacmanDecoration 在新布局下不遮挡内容

## 8. 清理与集成

- [x] 8.1 删除旧的 `components/QuickLinks.tsx`，更新 `App.tsx` 中的引用为 `BookmarkGrid`
- [x] 8.2 验证扩展构建无错误（`pnpm build`）
- [ ] 8.3 手动测试：书签增删改、持久化、Provider 卡片折叠、宽屏/窄屏响应式布局
