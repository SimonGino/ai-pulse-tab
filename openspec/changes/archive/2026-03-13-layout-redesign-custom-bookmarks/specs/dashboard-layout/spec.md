## ADDED Requirements

### Requirement: 响应式双列布局
页面 SHALL 在宽屏（≥1024px）下采用双列布局：左列显示 AI 用量 Provider 卡片，右列显示书签区域。窄屏（<1024px）下 SHALL 回退为单列垂直布局。

#### Scenario: 宽屏双列展示
- **WHEN** 用户在宽度 ≥1024px 的浏览器窗口打开新标签页
- **THEN** Provider 卡片和书签区域并排显示为两列

#### Scenario: 窄屏单列回退
- **WHEN** 用户在宽度 <1024px 的浏览器窗口打开新标签页
- **THEN** 页面回退为单列布局，Provider 卡片在上，书签区域在下

### Requirement: 内容区域居中
整体内容区域 SHALL 在页面中水平居中，设置合理的最大宽度以避免在超宽屏上过度拉伸。

#### Scenario: 超宽屏居中
- **WHEN** 用户在 2560px 宽的显示器上打开新标签页
- **THEN** 内容区域居中显示，两侧留有对称的空白区域

### Requirement: Provider 卡片可折叠
每个 Provider 卡片 SHALL 支持折叠/展开。折叠状态 SHALL 只显示 Provider 名称和最关键的用量概要。折叠状态 SHALL 持久化。

#### Scenario: 折叠 Provider 卡片
- **WHEN** 用户点击 Provider 卡片头部的折叠按钮
- **THEN** 卡片收缩为仅显示 Provider 名称和整体最高用量百分比的概要行

#### Scenario: 展开 Provider 卡片
- **WHEN** 用户点击已折叠卡片的展开按钮
- **THEN** 卡片展开显示完整的用量详情（组织列表、各配额条、倒计时等）

#### Scenario: 折叠状态持久化
- **WHEN** 用户折叠 Claude 卡片后关闭标签页并重新打开
- **THEN** Claude 卡片仍然处于折叠状态

### Requirement: 标题和底部工具栏位置
页面标题 SHALL 保持在页面顶部。刷新按钮和最后更新时间 SHALL 位于内容区域底部。

#### Scenario: 标题位置
- **WHEN** 用户打开新标签页
- **THEN** "AI Pulse Tab" 标题显示在页面顶部居中位置

#### Scenario: 底部工具栏
- **WHEN** 用户打开新标签页
- **THEN** 刷新按钮和最后更新时间显示在内容区域下方
