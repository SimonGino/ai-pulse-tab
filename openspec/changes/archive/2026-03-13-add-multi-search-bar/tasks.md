## 1. 搜索引擎常量与类型定义

- [x] 1.1 在 `core/constants.ts` 中添加搜索引擎配置数组（id、名称、URL 模板、图标标识）
- [x] 1.2 在 `core/types.ts` 中添加 `SearchEngine` 类型定义和引擎 ID 联合类型

## 2. 引擎偏好持久化 Hook

- [x] 2.1 创建 `hooks/useSearchEngine.ts` hook，管理当前引擎状态和 `chrome.storage.local` 持久化
- [x] 2.2 实现默认值逻辑：首次使用时默认为 Google

## 3. SearchBar 组件实现

- [x] 3.1 创建 `components/SearchBar.tsx` 组件，包含搜索输入框和 Enter 键跳转逻辑
- [x] 3.2 实现引擎选择器（左侧图标 + 点击弹出下拉菜单）
- [x] 3.3 实现点击外部区域关闭下拉菜单
- [x] 3.4 实现空输入不跳转的保护逻辑
- [x] 3.5 实现页面加载后搜索框自动聚焦

## 4. 像素风格样式

- [x] 4.1 为搜索栏添加像素风格 CSS（box-shadow 边框、pixel-font、主题色彩变量）
- [x] 4.2 为引擎选择器下拉菜单添加像素风格样式

## 5. 布局集成

- [x] 5.1 在 `App.tsx` 中将 SearchBar 组件插入标题下方、dashboard-grid 上方
- [x] 5.2 确保搜索栏宽度与内容区一致（maxWidth: 1200px）

## 6. 验证

- [x] 6.1 验证四个引擎的搜索跳转 URL 正确生成
- [x] 6.2 验证引擎偏好在标签页关闭后重新打开时正确恢复
- [x] 6.3 验证搜索栏在窄屏（<1024px）下的响应式表现
