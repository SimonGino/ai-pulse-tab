## Why

当前 AI Pulse Tab 新标签页界面单调朴素，仅展示 Claude 用量数据卡片，缺乏视觉吸引力和趣味性。用户每次打开新标签页都会看到这个页面，需要一个更有活力、更具个性的界面。同时，用户日常会频繁访问 AI 工具和社交平台，目前缺少快捷跳转入口。

## What Changes

- 全局 UI 改造为像素风格（Pixel Art / 8-bit 风格），包括字体、配色、边框、按钮等视觉元素
- 添加吃豆人主题装饰元素（如像素化吃豆人角色、豆子点缀等）
- 进度条改造为像素风格渲染
- 新增常用网站快捷跳转区域，预设站点包括：
  - claude.ai（Claude AI）
  - chatgpt.com（ChatGPT）
  - douyu.com（斗鱼直播）
  - x.com（X / Twitter）
- 快捷链接以像素风格图标展示，点击后在新标签页打开目标网站

## Capabilities

### New Capabilities
- `pixel-theme`: 像素风格主题系统，包括像素字体、8-bit 配色方案、像素化边框/按钮/进度条样式，以及吃豆人主题装饰动画
- `quick-links`: 常用网站快捷跳转功能，展示预设的社交平台和 AI 工具链接，以像素风格图标呈现

### Modified Capabilities
（无现有能力需要修改规格）

## Impact

- **UI 组件**: App.tsx、ProviderCard.tsx、QuotaBar.tsx 等需要样式重构
- **样式系统**: 需引入像素字体（如 Press Start 2P）和自定义 Tailwind 样式
- **新组件**: 需新建 QuickLinks 组件和吃豆人装饰组件
- **静态资源**: 需添加像素风格图标资源
- **依赖**: 可能需添加像素字体 Web Font
