## Context

AI Pulse Tab 是一个浏览器新标签页扩展，当前采用单列垂直布局（`flex-col items-center`，`max-w-2xl`），从上到下依次堆叠标题、Provider 卡片、快捷链接、刷新按钮。现有 4 个硬编码快捷链接已使页面拥挤，用户无法自定义。

技术栈：React 19 + TypeScript + WXT + Tailwind CSS 4，数据通过 Chrome Storage API 持久化。

## Goals / Non-Goals

**Goals:**
- 重构页面布局，充分利用宽屏空间，在内容增多时仍保持清爽
- 实现用户可自定义的书签系统（增删改 + 持久化）
- Provider 卡片支持折叠，减少纵向占用
- 保持像素主题一致性
- 平滑升级：首次升级自动写入默认书签

**Non-Goals:**
- 不做书签同步（跨设备/云端同步）
- 不做书签分组/文件夹
- 不做拖拽排序（后续迭代考虑）
- 不做书签 favicon 自动抓取（使用首字母图标）
- 不做设置页面（书签管理内联在新标签页完成）

## Decisions

### 1. 布局方案：宽屏双列 + 窄屏单列

**选择**：CSS Grid 响应式布局，宽屏时左侧 Provider 卡片、右侧书签区域；窄屏回退单列。

**替代方案**：
- 全部保持单列但缩小卡片 → 空间利用率低，宽屏浪费严重
- 三列布局 → 内容不足以支撑三列，显得空洞

**理由**：新标签页通常在宽屏打开，双列布局能将最核心的两类信息（AI 用量 + 书签）平行展示，减少滚动。使用 CSS Grid 的 `auto-fit` / media query 天然支持响应式。

### 2. 书签存储：Chrome Storage API（`storage.local`）

**选择**：与现有 `usageData` / `lastUpdated` 一样使用 `browser.storage.local`，新增 `bookmarks` 键。

**替代方案**：
- localStorage → 在扩展 Content Security Policy 下不可靠，且不与 background 共享
- IndexedDB → 过于重量级，书签数据量极小

**理由**：保持技术一致性，代码复用现有 storage 模式。书签数据量小（几十条 JSON），`storage.local` 足够。

### 3. 书签数据模型

```typescript
interface Bookmark {
  id: string;       // nanoid 生成
  name: string;     // 显示名称
  url: string;      // 网站 URL
  letter: string;   // 首字母图标（自动从 name 提取，用户可覆盖）
  color: string;    // 图标颜色（提供预设色板选择）
  order: number;    // 排序序号
}
```

**理由**：`letter` + `color` 沿用现有视觉方案，无需引入 favicon 抓取逻辑。`order` 字段为将来拖拽排序预留。

### 4. 书签编辑交互：内联弹窗（Modal）

**选择**：点击"+"按钮弹出像素风格 Modal，填写名称和 URL 即可添加；长按/右键已有书签弹出编辑/删除选项。

**替代方案**：
- 单独设置页面 → 跳出新标签页体验，路径过深
- 行内编辑（点击书签直接变输入框）→ 容易误触，与点击跳转冲突

**理由**：Modal 是最成熟的编辑模式，不干扰正常浏览，像素风格 Modal 也能强化主题感。

### 5. Provider 卡片折叠

**选择**：每个 Provider 卡片头部添加折叠/展开按钮，折叠状态只显示 Provider 名称和整体用量概要（最高用量百分比）。折叠状态持久化到 `storage.local`。

**理由**：当用户添加了较多书签后，Provider 卡片的详细信息可能不是每次都需要查看，折叠可以释放空间。

### 6. 书签网格自适应

**选择**：书签区域使用 `grid-template-columns: repeat(auto-fill, minmax(80px, 1fr))`，根据容器宽度自动决定列数。

**理由**：比固定列数更灵活，从 4 个书签到 20 个书签都能自然排列。

## Risks / Trade-offs

- **首次升级数据迁移** → 检测 `bookmarks` 键不存在时自动写入默认值，逻辑简单且幂等
- **书签数量无上限可能导致页面过长** → 设定合理的网格最大高度 + 滚动，或提示用户数量建议（soft limit）
- **nanoid 依赖** → 体积极小（~130B），对扩展包大小无影响；或用 `crypto.randomUUID()` 替代避免新依赖
- **Modal 在新标签页的 z-index 管理** → 新标签页层级简单，不会有复杂的 z-index 冲突
