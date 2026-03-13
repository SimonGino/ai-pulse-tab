## 1. 配色与字体基础设施

- [ ] 1.1 更新 `style.css` 中的 CSS 变量：`--pixel-green` → `#4ade80`，`--pixel-orange` → `#fb923c`，`--pixel-red` → `#f87171`，`--pixel-cyan` → `#22d3ee`，新增 `--pixel-reset-text: #9ca3af`
- [ ] 1.2 在 `index.html` 或 `style.css` 中引入 Google Fonts JetBrains Mono（latin 子集，font-display: swap）
- [ ] 1.3 在 `style.css` 中新增 `--font-data` CSS 变量和 `.data-font` 工具类，值为 `'JetBrains Mono', ui-monospace, monospace`
- [ ] 1.4 限制 `--pixel-yellow` 和 `--pixel-pink` 仅在 PacmanDecoration 组件中使用，从其他 UI 元素中移除引用

## 2. 布局重构

- [ ] 2.1 重构 `App.tsx` 布局结构：从双列 grid 改为垂直流（搜索栏 → 书签栏 → 用量卡片区域 → 底部工具栏）
- [ ] 2.2 将 `BookmarkGrid` 组件移至搜索栏下方，改为全宽水平排列布局
- [ ] 2.3 用量卡片区域在桌面端（≥1024px）实现 Claude 和 ChatGPT 左右并排两列，窄屏下单列堆叠
- [ ] 2.4 缩小页面标题 "AI Pulse Tab" 为左上角小标签，不再居中大字展示
- [ ] 2.5 调整底部工具栏："Last updated" 改为小号灰色文字，刷新按钮紧跟用量卡片区域下方

## 3. 组件样式优化

- [ ] 3.1 更新 `QuotaBar.tsx`：进度条高度从 ~8px 提升到 ~16px，段间间距缩小
- [ ] 3.2 更新 `ResetCountdown.tsx`：倒计时文字颜色从红色改为 `--pixel-reset-text`（灰色）
- [ ] 3.3 更新 `ProviderCard.tsx`：数据文本（百分比、计划名称、组织名称）应用 `.data-font` 类
- [ ] 3.4 更新 `ProviderCard.tsx`：各用量指标之间增加视觉分隔（细线或增大间距）
- [ ] 3.5 更新 `QuotaBar.tsx`：进度条颜色引用更新后的 CSS 变量

## 4. 交互增强

- [ ] 4.1 更新 `ProviderCard.tsx`：Provider 标题文字可点击，点击后在新标签页打开对应服务（Claude → claude.ai，ChatGPT → chatgpt.com）
- [ ] 4.2 确保点击跳转与折叠按钮互不干扰（事件区域分离）

## 5. 验证与收尾

- [ ] 5.1 在 ≥1024px 宽屏下验证垂直流布局效果
- [ ] 5.2 在 <1024px 窄屏下验证单列回退效果
- [ ] 5.3 验证字体加载回退行为（JetBrains Mono 未加载时使用系统等宽字体）
- [ ] 5.4 运行现有测试确保无回归
