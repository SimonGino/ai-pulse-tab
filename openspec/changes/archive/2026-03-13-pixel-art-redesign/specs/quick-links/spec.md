## ADDED Requirements

### Requirement: 快捷链接区域展示
页面 SHALL 在用量卡片下方展示一个快捷链接区域，包含预设的常用网站列表。链接区域 SHALL 使用网格布局排列。

#### Scenario: 快捷链接区域可见
- **WHEN** 用户打开新标签页
- **THEN** 用量卡片下方显示快捷链接网格区域，包含至少 4 个网站链接

### Requirement: 预设网站列表
快捷链接 SHALL 包含以下预设网站：
- claude.ai（Claude AI）
- chatgpt.com（ChatGPT）
- douyu.com（斗鱼直播）
- x.com（X / Twitter）

#### Scenario: 预设网站完整展示
- **WHEN** 快捷链接区域渲染
- **THEN** 上述 4 个网站全部以卡片形式展示，每个卡片包含网站名称和图标

### Requirement: 快捷链接像素风格
每个快捷链接 SHALL 以像素风格卡片呈现，包含像素化图标和网站名称。卡片风格 SHALL 与页面整体像素主题一致。

#### Scenario: 链接卡片像素风格
- **WHEN** 快捷链接卡片渲染
- **THEN** 卡片具有像素边框、像素图标，文字使用像素字体

#### Scenario: 链接卡片悬停效果
- **WHEN** 用户将鼠标悬停在某个链接卡片上
- **THEN** 卡片显示像素风格高亮效果（如边框颜色变化或亮度提升）

### Requirement: 链接在新标签页打开
点击快捷链接 SHALL 在新标签页中打开目标网站 URL。

#### Scenario: 点击链接跳转
- **WHEN** 用户点击 "Claude AI" 链接卡片
- **THEN** 浏览器在新标签页打开 https://claude.ai

#### Scenario: 所有链接均新标签页打开
- **WHEN** 用户点击任意快捷链接
- **THEN** 链接以 target="_blank" 方式在新标签页打开，当前页面保持不变
