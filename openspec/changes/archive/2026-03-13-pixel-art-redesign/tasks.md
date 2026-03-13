## 1. 像素字体与基础样式

- [x] 1.1 在 index.html 中引入 Google Fonts "Press Start 2P" 字体（或在 style.css 中 @import），并配置 font-display: swap
- [x] 1.2 在 style.css 中添加像素主题全局样式：像素字体 font-family、8-bit 配色 CSS 变量、像素边框 box-shadow 工具类
- [x] 1.3 更新 App.tsx 页面背景和标题为像素风格（深色背景、像素字体标题）

## 2. 像素化 UI 组件改造

- [x] 2.1 改造 ProviderCard.tsx：像素边框（直角 + box-shadow 阶梯边框）、像素风配色
- [x] 2.2 改造 QuotaBar.tsx：进度条改为离散方块填充样式，保留绿/橙/红颜色分级逻辑
- [x] 2.3 改造"刷新"按钮为像素风格：方形设计、hover 像素高亮效果
- [x] 2.4 改造 ResetCountdown.tsx 和其他文本标签为像素风格

## 3. 吃豆人装饰动画

- [x] 3.1 创建 PacmanDecoration 组件：纯 CSS 绘制吃豆人角色（box-shadow 像素绘制 + 嘴部开合动画）
- [x] 3.2 添加吃豆人水平移动动画（CSS @keyframes），确保不遮挡主内容区域
- [x] 3.3 添加像素豆子（dots）装饰元素分布在页面适当位置
- [x] 3.4 可选：添加幽灵角色装饰和简化迷宫线条背景

## 4. 快捷链接功能

- [x] 4.1 创建 QuickLinks 组件：网格布局，渲染预设网站列表（claude.ai、chatgpt.com、douyu.com、x.com）
- [x] 4.2 为每个链接卡片实现像素风格样式：像素边框、像素图标（CSS 绘制或首字母像素化）、网站名称
- [x] 4.3 实现链接点击行为：target="_blank" 新标签页打开，rel="noopener noreferrer"
- [x] 4.4 添加链接卡片 hover 效果：像素风格高亮（边框颜色变化 / 亮度提升）

## 5. 集成与调试

- [x] 5.1 在 App.tsx 中集成 QuickLinks 组件和 PacmanDecoration 组件
- [x] 5.2 检查浏览器扩展 CSP 配置，确保 Google Fonts 可正常加载（必要时改用内联字体或 wxt.config.ts 配置 CSP）
- [x] 5.3 整体视觉走查：确认各组件像素风格一致、动画不干扰交互、布局响应正常
