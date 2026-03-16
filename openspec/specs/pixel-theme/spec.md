## ADDED Requirements

### Requirement: 书签卡片像素风格
书签卡片 SHALL 采用紧凑的灰色调像素风格：像素边框（box-shadow 阶梯状）、深色背景、灰色文字。书签图标 SHALL 使用 favicon 而非彩色字母。悬停时 SHALL 显示灰色高亮效果。

#### Scenario: 书签卡片渲染
- **WHEN** 书签区域渲染用户的书签
- **THEN** 每个书签以紧凑像素风格呈现，包含 favicon 图标和灰色名称标签

#### Scenario: 书签卡片悬停效果
- **WHEN** 用户将鼠标悬停在某个书签卡片上
- **THEN** 卡片显示 `--pixel-hover-bg` 背景色和灰色边框高亮

### Requirement: 添加按钮像素风格
书签网格末尾的"+"添加按钮 SHALL 使用像素风格，与书签卡片大小一致，使用虚线像素边框区分。

#### Scenario: 添加按钮渲染
- **WHEN** 书签网格渲染
- **THEN** 末尾显示一个"+"按钮，大小与书签卡片一致，使用虚线边框风格

### Requirement: Modal 弹窗像素风格
书签添加/编辑 Modal SHALL 使用像素风格：像素边框、深色背景、像素字体标题、像素风格输入框和按钮。Modal 背景 SHALL 使用半透明遮罩。

#### Scenario: Modal 弹窗视觉
- **WHEN** 用户点击"+"按钮打开添加书签 Modal
- **THEN** Modal 使用像素边框和深色背景，输入框和按钮均为像素风格

#### Scenario: Modal 遮罩
- **WHEN** Modal 打开时
- **THEN** Modal 后方显示半透明黑色遮罩，点击遮罩关闭 Modal

### Requirement: 折叠按钮像素风格
Provider 卡片的折叠/展开按钮 SHALL 使用像素风格图标（如像素化的箭头或三角形），与卡片标题同行显示。

#### Scenario: 折叠按钮渲染
- **WHEN** Provider 卡片渲染
- **THEN** 卡片标题右侧显示一个像素风格的展开/折叠箭头图标

### Requirement: 右键上下文菜单像素风格
书签的右键上下文菜单 SHALL 使用像素风格：像素边框、深色背景、像素字体菜单项。

#### Scenario: 右键菜单渲染
- **WHEN** 用户右键点击一个书签
- **THEN** 显示像素风格的上下文菜单，包含"编辑"和"删除"选项

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
页面 SHALL 使用灰度为主的配色体系。唯一的饱和色为 quota bar 的状态色：正常/低用量 `#4ade80`（绿），中用量/警告 `#fb923c`（橙），高用量/危险 `#f87171`（红）。所有其他 UI 元素（搜索栏、书签、section header、provider 名称）SHALL 使用灰度色（`--pixel-white`、`--pixel-gray`、`--pixel-border`）。`--pixel-cyan` SHALL 不再作为 UI 强调色。`--pixel-yellow` 和 `--pixel-pink` SHALL 删除（随 Pac-Man 组件移除）。

#### Scenario: 低用量进度条颜色
- **WHEN** 某配额使用率 < 50%
- **THEN** 进度条使用 `#4ade80` 绿色

#### Scenario: 中用量进度条颜色
- **WHEN** 某配额使用率在 50%-80% 之间
- **THEN** 进度条使用 `#fb923c` 橙色

#### Scenario: 高用量进度条颜色
- **WHEN** 某配额使用率 > 80%
- **THEN** 进度条使用 `#f87171` 红色

#### Scenario: 搜索栏灰色调
- **WHEN** 搜索栏渲染
- **THEN** 搜索引擎选择器文字、分隔线、placeholder 均使用灰度色，不使用 cyan

#### Scenario: Provider 名称灰色调
- **WHEN** Provider 卡片渲染标题
- **THEN** Provider 名称使用 `--pixel-white`，不使用品牌色（amber/teal）

#### Scenario: Section header 灰色调
- **WHEN** 页面渲染 "BOOKMARKS" 等 section 标题
- **THEN** 标题使用 `--pixel-gray`，不使用 cyan

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
