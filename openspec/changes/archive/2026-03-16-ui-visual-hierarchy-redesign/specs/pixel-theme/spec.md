## MODIFIED Requirements

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

### Requirement: 书签卡片像素风格
书签卡片 SHALL 采用紧凑的灰色调像素风格：像素边框（box-shadow 阶梯状）、深色背景、灰色文字。书签图标 SHALL 使用 favicon 而非彩色字母。悬停时 SHALL 显示灰色高亮效果。

#### Scenario: 书签卡片渲染
- **WHEN** 书签区域渲染用户的书签
- **THEN** 每个书签以紧凑像素风格呈现，包含 favicon 图标和灰色名称标签

#### Scenario: 书签卡片悬停效果
- **WHEN** 用户将鼠标悬停在某个书签卡片上
- **THEN** 卡片显示 `--pixel-hover-bg` 背景色和灰色边框高亮

## REMOVED Requirements

### Requirement: 颜色预设选择
**Reason**: 书签改为 favicon 展示，不再需要用户选择图标颜色。
**Migration**: BookmarkModal 移除颜色选择器 UI，`Bookmark` 类型中 `color` 字段改为 optional。
