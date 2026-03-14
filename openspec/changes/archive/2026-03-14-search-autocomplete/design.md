## Context

AI Pulse Tab 是一个浏览器扩展，在新标签页上展示 AI 服务用量。当前搜索栏（`SearchBar.tsx`）支持 4 个搜索引擎（Google、Bing、DuckDuckGo、Perplexity），用户输入查询后按 Enter 在新标签页打开搜索结果。

目前没有任何搜索建议功能——用户必须完整输入关键词。搜索相关代码分散在 `core/constants.ts`、`core/types.ts`、`core/search-engine-utils.ts`、`hooks/useSearchEngine.ts` 和 `components/SearchBar.tsx` 中，缺乏模块化组织。

## Goals / Non-Goals

**Goals:**

- 用户输入时通过搜索引擎的 Suggest API 实时获取候选建议并展示
- 支持键盘导航（↑/↓ 选择，Enter 确认，Esc 关闭）和鼠标点击
- 建议列表保持像素风格，视觉一致
- 将搜索相关代码整理为 Search 模块，提升代码组织性
- 合理的防抖策略，避免过多网络请求

**Non-Goals:**

- 不做搜索历史记录或本地缓存
- 不做搜索结果内联预览
- 不支持 Perplexity 的 Suggest API（Perplexity 没有公开的搜索建议接口，输入时不展示建议）

## Decisions

### 1. Suggest API 选型

**决定**：使用各搜索引擎原生的 Suggest/Autocomplete API。

| 引擎 | API 端点 | 说明 |
|------|---------|------|
| Google | `https://suggestqueries.google.com/complete/search?client=chrome&q={query}` | 返回 JSON 数组，CORS 友好 |
| Bing | `https://api.bing.com/osjson.aspx?query={query}` | OpenSearch JSON 格式 |
| DuckDuckGo | `https://duckduckgo.com/ac/?q={query}&type=list` | OpenSearch JSON 格式 |
| Perplexity | 无 | 不支持，输入时不显示建议 |

**替代方案**：统一使用 Google Suggest API，忽略引擎差异——但这样用户选择不同引擎时建议不匹配，体验不一致。

**理由**：每个引擎的建议与其搜索结果相关性最高，使用对应 API 更准确。

### 2. 请求策略

**决定**：使用 300ms 防抖 + AbortController 取消未完成请求。

- 用户停止输入 300ms 后才发起请求
- 新请求发出时取消前一个未完成的请求
- 输入少于 2 个字符时不请求

**理由**：300ms 是输入延迟和响应速度的合理平衡点，AbortController 避免过期建议覆盖最新结果。

### 3. 跨域请求处理

**决定**：在 `wxt.config.ts` 的 `host_permissions` 中添加 Suggest API 域名，利用浏览器扩展的跨域特权直接 `fetch`。

**替代方案**：使用 background script 中转请求——增加复杂度，无明显收益。

**理由**：浏览器扩展有天然的跨域能力，添加 host_permissions 是最简单直接的方案。

### 4. 代码组织 — Search 模块

**决定**：不移动现有文件路径，而是新增搜索建议相关代码到现有目录结构中。

- 新增 `hooks/useSearchSuggestions.ts`：建议获取逻辑
- 新增 `components/SearchSuggestions.tsx`：建议列表 UI
- 现有搜索相关代码（类型、常量、工具函数）保持原位

**替代方案**：创建 `modules/search/` 目录，迁移所有搜索相关文件——过度重构，不值得。

**理由**：项目规模较小，现有目录结构清晰。按 hooks/components/core 分类已经是合理的模块化。大规模文件迁移会产生不必要的 diff 和破坏性变更。

## Risks / Trade-offs

- **Suggest API 可用性**：第三方 API 可能变更或限流 → 超时 2 秒自动放弃，建议列表为可选增强功能，不影响核心搜索
- **请求权限膨胀**：需要在 manifest 中添加新的 host_permissions → 仅添加必要的 Suggest API 域名，最小权限原则
- **Perplexity 无建议**：用户选择 Perplexity 时无法提供建议 → 清晰告知（placeholder 提示或不显示建议区域）
- **输入延迟感**：300ms 防抖可能让用户感觉有延迟 → 可后续调优，300ms 是常见默认值
