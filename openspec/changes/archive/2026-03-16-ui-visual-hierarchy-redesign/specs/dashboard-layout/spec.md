## MODIFIED Requirements

### Requirement: 响应式垂直流布局
页面 SHALL 采用垂直流布局：用量卡片区域（全宽）→ 搜索栏 → 书签栏（全宽）。用量卡片区域在宽屏（≥1024px）下 SHALL 将 Claude 和 ChatGPT 卡片左右并排为两列。窄屏（<1024px）下 SHALL 回退为单列垂直布局。当无任何 provider 数据时（未登录），布局 SHALL 自动调整为：搜索栏 → 未登录提示 → 书签栏。

#### Scenario: 宽屏垂直流布局（已登录）
- **WHEN** 用户已登录至少一个 provider 且浏览器窗口宽度 ≥1024px
- **THEN** 页面从上到下依次显示：用量卡片区域（左右并排）、搜索栏、书签栏

#### Scenario: 窄屏单列回退
- **WHEN** 用户在宽度 <1024px 的浏览器窗口打开新标签页
- **THEN** 页面回退为单列布局，用量卡片依次在上，搜索栏和书签栏在下

#### Scenario: 未登录时搜索栏升顶
- **WHEN** 用户未登录任何 provider（无 quota 数据）
- **THEN** 搜索栏显示在页面最顶部，下方显示未登录提示和书签栏

### Requirement: 标题和底部工具栏位置
页面标题 SHALL 移除或以极淡样式显示（不再作为可见 UI 元素）。刷新按钮和最后更新时间 SHALL 位于用量卡片区域底部。

#### Scenario: 标题不可见
- **WHEN** 用户打开新标签页
- **THEN** "AI Pulse Tab" 标题不再显示，或以极低对比度融入背景

#### Scenario: 底部工具栏
- **WHEN** 用户打开新标签页
- **THEN** 刷新按钮紧跟在用量卡片区域下方，"Last updated" 以小号灰色文字显示

## REMOVED Requirements

### Requirement: Pac-Man 底部装饰
**Reason**: 在新的灰度配色体系下，Pac-Man 的黄色和粉色会破坏"quota 是唯一彩色区域"的设计规则，且灰度版本失去装饰价值。
**Migration**: 直接删除 `PacmanDecoration` 组件和 `PacmanDecoration.css`，无需迁移。
