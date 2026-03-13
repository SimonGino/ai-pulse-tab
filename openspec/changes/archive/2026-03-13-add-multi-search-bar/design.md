## Context

AI Pulse Tab 是一个浏览器新标签页扩展，当前布局为：标题 → 双列内容区（左侧 Provider 用量卡片 + 右侧书签）→ 底部刷新工具栏 → Pac-Man 装饰。使用 React 19 + TailwindCSS 4 + WXT 构建，所有状态存储在 `chrome.storage.local`。

用户希望在新标签页增加一个搜索栏，默认使用 Google 搜索，并可快速切换到 Bing、DuckDuckGo、Perplexity 等通用搜索引擎。

## Goals / Non-Goals

**Goals:**
- 在标题下方、内容区上方插入搜索栏，用户可直接输入关键词发起搜索
- 支持 Google、Bing、DuckDuckGo、Perplexity 四个搜索引擎切换
- 用户的引擎偏好持久化到 `chrome.storage.local`
- 搜索栏风格与现有像素主题一致

**Non-Goals:**
- 不实现搜索建议/自动补全（可作为后续迭代）
- 不实现搜索历史记录
- 不在扩展内嵌入搜索结果（直接跳转到目标平台）
- 不支持自定义搜索引擎（本次仅支持固定的四个引擎）

## Decisions

### 1. 搜索栏位置：标题与内容区之间

将搜索栏放在标题 `<h1>` 下方、`dashboard-grid` 上方，占满内容区宽度（`maxWidth: 1200px`）。

**为何不放在标题内或侧边栏？** 搜索是高频操作，应有独立且醒目的位置。放在标题下方既符合用户对新标签页搜索栏的心理预期（类似 Chrome 默认新标签页），又不破坏现有双列布局。

### 2. 引擎切换方式：搜索栏内左侧图标按钮

在搜索输入框的左侧放置当前引擎图标，点击后弹出引擎选择下拉列表。

**备选方案 - 搜索栏上方 Tab 切换：** 更直观但占用更多垂直空间，与像素风格的紧凑布局理念不符。

**备选方案 - 搜索栏右侧按钮组：** 所有引擎同时显示为按钮。虽然切换更快，但在窄屏上空间不够，且四个按钮并排会让搜索栏看起来拥挤。

### 3. 搜索跳转策略：新标签页中打开

用户按下 Enter 后，通过 `window.open(url, '_blank')` 在新标签页打开搜索结果。这样用户可以保留 AI Pulse Tab 继续使用。

对于其他搜索引擎，跳转 URL 使用各平台支持的查询参数：
- Google: `https://www.google.com/search?q={query}`
- Bing: `https://www.bing.com/search?q={query}`
- DuckDuckGo: `https://duckduckgo.com/?q={query}`
- Perplexity: `https://www.perplexity.ai/search?q={query}`

### 4. 偏好持久化：chrome.storage.local

新增存储键 `preferredSearchEngine`，值为引擎 ID 字符串（`'google' | 'bing' | 'duckduckgo' | 'perplexity'`）。默认值为 `'google'`。

使用与现有 `useBookmarks` hook 类似的模式，创建 `useSearchEngine` hook 管理引擎选择状态和持久化。

### 5. 组件结构

```
SearchBar.tsx
├── EngineSelector (当前引擎图标 + 下拉菜单)
├── <input> (搜索输入框)
└── 搜索按钮 (可选，主要靠 Enter 触发)
```

单一组件文件 `SearchBar.tsx`，内部包含引擎选择器逻辑。不需要拆分为多个文件，因为组件逻辑较简单。

### 6. 样式方案：复用现有 pixel-theme 变量

使用现有的 CSS 变量（`--pixel-black`, `--pixel-white`, `--pixel-yellow` 等）和 `pixel-font` 类。搜索栏边框使用 `box-shadow` 实现像素风格，与现有卡片一致。

## Risks / Trade-offs

- **[搜索引擎 URL 参数变更]** → Bing/DuckDuckGo/Perplexity 的查询参数格式可能随时变化。缓解：将 URL 模板集中定义在常量文件中，便于快速更新。
- **[搜索栏抢占视觉焦点]** → 搜索栏可能比用量数据更醒目，改变产品定位感。缓解：保持搜索栏尺寸克制，不使用过于抢眼的颜色，让它融入而非主导。
- **[垂直空间增加]** → 新增搜索栏会推挤下方内容。缓解：搜索栏高度控制在 40-50px 内，加上间距不超过 70px 的垂直空间占用。
