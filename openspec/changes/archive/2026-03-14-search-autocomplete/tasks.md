## 1. 权限与配置

- [x] 1.1 在 `wxt.config.ts` 的 `host_permissions` 中添加 Suggest API 所需域名（`suggestqueries.google.com`、`api.bing.com`、`duckduckgo.com`）
- [x] 1.2 在 `core/constants.ts` 的 `SEARCH_ENGINES` 中为每个引擎添加 `suggestUrl` 字段（Perplexity 设为 `null`）
- [x] 1.3 在 `core/types.ts` 的 `SearchEngine` 接口中添加 `suggestUrl?: string` 可选字段

## 2. 搜索建议获取逻辑

- [x] 2.1 创建 `hooks/useSearchSuggestions.ts`：实现防抖（300ms）+ AbortController + fetch 调用 Suggest API，返回建议列表
- [x] 2.2 处理不同引擎的响应格式解析（Google JSON 数组、Bing/DuckDuckGo OpenSearch JSON）
- [x] 2.3 处理边界情况：输入 < 2 字符不请求、引擎无 suggestUrl 时返回空数组、请求超时 2 秒自动放弃

## 3. 建议列表 UI 组件

- [x] 3.1 创建 `components/SearchSuggestions.tsx`：展示建议列表，最多 8 条，支持高亮状态
- [x] 3.2 在 `style.css` 中添加建议列表的像素风格样式（下拉定位、高亮色、字体）

## 4. 键盘与鼠标交互集成

- [x] 4.1 修改 `SearchBar.tsx`：集成 `useSearchSuggestions` hook 和 `SearchSuggestions` 组件
- [x] 4.2 实现键盘导航：↑/↓ 移动高亮（循环），Enter 选中执行搜索，Esc 关闭列表
- [x] 4.3 实现鼠标交互：点击建议项执行搜索，点击外部关闭列表
- [x] 4.4 处理引擎切换时清空建议列表

## 5. 测试

- [ ] 5.1 为 `useSearchSuggestions` hook 编写单元测试（防抖、取消、边界条件）<!-- skipped: no test framework configured -->
- [x] 5.2 手动验证各引擎的建议功能和键盘导航
