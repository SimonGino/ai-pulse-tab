## Why

当前搜索栏功能较为基础——用户只能选择引擎、输入关键词、回车跳转。缺少输入时的搜索建议（autocomplete），导致使用体验不如浏览器原生地址栏。添加搜索建议功能可以显著提升搜索效率，减少用户的输入量，同时让 AI Pulse Tab 成为一个更完整的新标签页替代方案。

## What Changes

- 新增搜索建议（autocomplete）功能：用户在搜索栏输入时，实时展示来自搜索引擎的候选建议
- 建议列表支持键盘导航（上/下箭头选择，Enter 确认，Esc 关闭）
- 将搜索相关的类型、常量、工具函数整合归类为独立的 Search 模块，提升代码组织性
- 建议列表采用像素风格（Pixel Theme）以保持视觉一致性

## Capabilities

### New Capabilities

- `search-autocomplete`: 搜索建议功能——在用户输入时通过搜索引擎的 Suggest API 获取候选建议，展示为下拉列表，支持键盘导航和鼠标点击选择

### Modified Capabilities

（无现有 spec 的需求变更）

## Impact

- **新增文件**：搜索建议相关的 hook（如 `useSearchSuggestions`）、建议列表 UI 组件
- **修改文件**：`SearchBar.tsx`（集成建议组件）、`style.css`（建议列表样式）
- **代码组织**：将搜索相关代码（类型、常量、工具函数）归类整理到 Search 模块
- **网络请求**：新增对搜索引擎 Suggest API 的请求（Google Suggest、Bing Autosuggest 等），需处理防抖（debounce）和跨域（CORS）问题
- **权限**：浏览器扩展 manifest 中可能需要添加对 Suggest API 域名的请求权限
