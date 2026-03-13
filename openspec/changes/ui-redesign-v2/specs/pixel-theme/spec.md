## MODIFIED Requirements

### Requirement: 书签卡片像素风格
书签卡片 SHALL 保持像素风格：像素边框（box-shadow 阶梯状）、像素字体图标、深色背景。悬停时 SHALL 显示对应书签颜色的高亮效果。配色 SHALL 使用精简后的调色板（降低饱和度的 Tailwind 400 色阶）。

#### Scenario: 书签卡片渲染
- **WHEN** 书签区域渲染用户的书签
- **THEN** 每个书签以像素风格卡片呈现，包含彩色字母图标和名称标签

#### Scenario: 书签卡片悬停效果
- **WHEN** 用户将鼠标悬停在某个书签卡片上
- **THEN** 卡片显示该书签配置颜色的像素风格高亮效果

## ADDED Requirements

### Requirement: 双字体策略
页面 SHALL 使用两套字体：标题、装饰元素和品牌文字使用 "Press Start 2P" 像素字体；数据展示区域（用量百分比、计划名称、倒计时、组织名称等）SHALL 使用 JetBrains Mono 等宽可读字体。字体 SHALL 通过 Google Fonts CDN 加载，使用 `font-display: swap` 确保加载前可用系统等宽字体。

#### Scenario: 标题使用像素字体
- **WHEN** 页面渲染 Provider 卡片标题（如 "Claude"、"ChatGPT"）
- **THEN** 标题文字使用 "Press Start 2P" 像素字体

#### Scenario: 数据区域使用可读字体
- **WHEN** 页面渲染用量百分比（如 "2%"）、计划名称（如 "Plan: Max 5x"）和倒计时（如 "RESET: 4h 20m"）
- **THEN** 这些数据文字使用 JetBrains Mono 等宽字体

#### Scenario: 字体加载回退
- **WHEN** JetBrains Mono 字体尚未加载完成
- **THEN** 数据区域使用系统等宽字体（ui-monospace, monospace）作为回退

### Requirement: 精简配色方案
页面 SHALL 使用精简后的配色方案：正常/低用量使用 `#4ade80`（降饱和绿），中用量/警告使用 `#fb923c`（降饱和橙），高用量/危险使用 `#f87171`（降饱和红），主强调色使用 `#22d3ee`（降饱和青）。倒计时文字 SHALL 使用 `#9ca3af`（灰色），不再使用红色。`--pixel-yellow` 和 `--pixel-pink` SHALL 仅保留在 Pacman 装饰元素中，不再用于主要 UI。

#### Scenario: 低用量进度条颜色
- **WHEN** 某配额使用率 < 50%
- **THEN** 进度条使用 `#4ade80` 绿色

#### Scenario: 中用量进度条颜色
- **WHEN** 某配额使用率在 50%-80% 之间
- **THEN** 进度条使用 `#fb923c` 橙色

#### Scenario: 高用量进度条颜色
- **WHEN** 某配额使用率 > 80%
- **THEN** 进度条使用 `#f87171` 红色

#### Scenario: 倒计时文字颜色
- **WHEN** 页面渲染 RESET 倒计时
- **THEN** 倒计时文字使用 `#9ca3af` 灰色而非红色

### Requirement: 进度条加宽
QuotaBar 组件 SHALL 使用加宽的条状设计（高度约 16px），保持 10 段分段但段间间距缩小，视觉上更连续。

#### Scenario: 进度条高度
- **WHEN** 页面渲染用量进度条
- **THEN** 进度条高度约为 16px，比之前的 ~8px 明显更宽

#### Scenario: 进度条分段
- **WHEN** 页面渲染用量进度条
- **THEN** 进度条保持 10 段分段设计，段间间距缩小形成更连续的视觉效果

### Requirement: 卡片内信息层级
Provider 卡片内的各用量指标（Session、Weekly、Model-specific 等）之间 SHALL 有清晰的视觉分隔（如细线分隔或间距增大），避免信息堆叠为一团文字。

#### Scenario: 用量指标分隔
- **WHEN** Provider 卡片展开显示多个配额指标
- **THEN** 各指标之间有明显的视觉分隔（分隔线或增大间距），用户可快速区分不同指标
