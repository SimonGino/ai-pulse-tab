## ADDED Requirements

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
页面标题 SHALL 移除或以极淡样式显示（不再作为可见 UI 元素）。刷新按钮和最后更新时间 SHALL 位于用量卡片区域底部。

#### Scenario: 标题不可见
- **WHEN** 用户打开新标签页
- **THEN** "AI Pulse Tab" 标题不再显示，或以极低对比度融入背景

#### Scenario: 底部工具栏
- **WHEN** 用户打开新标签页
- **THEN** 刷新按钮紧跟在用量卡片区域下方，"Last updated" 以小号灰色文字显示

### Requirement: Provider 卡片点击跳转
每个 Provider 卡片的标题区域 SHALL 支持点击跳转到对应服务的网站（Claude → claude.ai，ChatGPT → chatgpt.com）。跳转 SHALL 在新标签页中打开。

#### Scenario: 点击 Claude 卡片标题跳转
- **WHEN** 用户点击 Claude 卡片的标题文字 "Claude"
- **THEN** 浏览器在新标签页中打开 https://claude.ai

#### Scenario: 点击 ChatGPT 卡片标题跳转
- **WHEN** 用户点击 ChatGPT 卡片的标题文字 "ChatGPT"
- **THEN** 浏览器在新标签页中打开 https://chatgpt.com

#### Scenario: 跳转不影响折叠操作
- **WHEN** 用户点击折叠/展开按钮
- **THEN** 仅折叠/展开卡片，不触发跳转
