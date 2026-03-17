## Context

当前新标签页采用 Title → Search → Bookmarks → Quota 的垂直布局，配合 10+ 种饱和色的像素主题。UX 审查指出两个核心问题：视觉层级扁平（无焦点）和颜色噪音过高。用户确认 quota 用量数据是页面的视觉主角。

现有技术栈：React + WXT + Tailwind CSS，组件化架构，CSS 变量管理主题色。

## Goals / Non-Goals

**Goals:**
- 让 quota 用量数据成为页面的视觉焦点（位置最高、唯一彩色区域）
- 将颜色体系收敛为灰度 + quota 状态色（green/orange/red）
- 书签改用 favicon 展示，降低视觉噪音
- 未登录时提供合理的空状态布局

**Non-Goals:**
- 不改变 quota 数据的获取逻辑和刷新机制
- 不改变 Provider 卡片的折叠/展开功能
- 不增加新的 provider 支持
- 不改变搜索栏的功能（引擎切换、自动补全等）
- 不做响应式布局的大幅重构（保持现有断点逻辑）

## Decisions

### 1. 布局顺序：Quota 置顶

**决定：** App.tsx 渲染顺序改为 Quota Cards → Search → Bookmarks → Footer。

**替代方案：** 保持搜索在顶部但视觉放大 quota（方案 B）——被否决，因为无法通过纯视觉手段让位于第四层的元素成为焦点。

### 2. 颜色策略：灰度 + 功能色

**决定：**
- 删除或降灰：`--pixel-cyan` 在 UI 元素中不再作为强调色，section header / 搜索栏 / provider 名称全部使用 `--pixel-white` 或 `--pixel-gray`
- 保留功能色：`--pixel-green`、`--pixel-orange`、`--pixel-red` 仅用于 quota bar
- CSS 变量保留定义（其他组件可能引用），但主 UI 元素不再使用饱和色

**理由：** 只有 quota 有颜色时，它自然成为视觉锚点，无需额外放大。

### 3. 书签 Favicon 获取

**决定：** 使用 Google Favicon 服务 `https://www.google.com/s2/favicons?domain={domain}&sz=32` 获取 favicon。

**Fallback 链：**
1. Google Favicon 服务返回图标 → 使用
2. 图片加载失败（onerror）→ 显示灰色首字母（从 bookmark name 取第一个字符）

**替代方案考虑：**
- 直接请求 `{url}/favicon.ico`：跨域问题多，很多站点不在根路径放 favicon
- Chrome `chrome://favicon/` API：需要额外权限，Chrome Web Store 审核敏感
- 本地缓存 favicon：增加存储复杂度，不值得

**数据模型变更：** `Bookmark` 类型中 `letter` 和 `color` 改为 optional。新增书签不再需要这两个字段。已有数据向后兼容——旧书签仍保留 letter/color，但 UI 不再使用 color，letter 仅作 fallback。

### 4. 未登录时布局自适应

**决定：** 当 `hasAnyData === false` 时，渲染顺序变为 Search → "NOT LOGGED IN" 提示 → Bookmarks。即搜索栏升到顶部填补 quota 空缺。

**实现方式：** App.tsx 中用条件渲染：
```
{hasAnyData && <QuotaSection />}
<SearchBar />
{!hasAnyData && <NotLoggedInHint />}
<BookmarkGrid />
```

### 5. 删除 Pac-Man 装饰

**决定：** 完全删除 `PacmanDecoration` 组件和 `PacmanDecoration.css`，不做灰度保留。

**理由：** 灰度 Pac-Man 失去了装饰价值，而且底部固定定位会影响布局。清除更干净。

### 6. BookmarkModal 表单简化

**决定：** 移除颜色选择器和字母输入字段。添加/编辑书签只需要 name 和 URL。

**Letter 自动提取：** 从 name 的第一个字符自动提取，仅作 favicon 加载失败时的 fallback，不再暴露给用户。

## Risks / Trade-offs

- **Google Favicon 服务依赖** → 该服务长期稳定，且有 fallback 到首字母；离线时所有书签显示首字母，功能不受影响
- **已有书签数据兼容** → `letter`/`color` 改为 optional 而非删除，旧数据无需迁移
- **视觉单调风险（颜色太少）** → 灰度体系中通过不同灰度层级（white/gray/border/dark）维持层次感；quota 的彩色在灰色背景中会更突出
- **搜索习惯改变** → 搜索栏下移一个位置，用户可能需要适应；但新标签页的主要价值是看 quota，搜索是次要功能
