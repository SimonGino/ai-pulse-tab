## ADDED Requirements

### Requirement: 像素字体应用
页面标题和英文标签 SHALL 使用 "Press Start 2P" 像素字体渲染。中文内容 SHALL 使用系统默认字体回退。字体加载 SHALL 使用 font-display: swap 策略，避免文字不可见。

#### Scenario: 页面标题使用像素字体
- **WHEN** 用户打开新标签页
- **THEN** "AI Pulse Tab" 标题以 Press Start 2P 像素字体显示

#### Scenario: 中文内容回退到系统字体
- **WHEN** 页面包含中文文本（如"重置"、"刷新"）
- **THEN** 中文文本使用系统默认字体渲染，不使用像素字体

### Requirement: 像素风格配色方案
页面 SHALL 采用 8-bit 风格配色，背景使用深色调，前景元素使用高对比度的明亮色彩（如吃豆人经典的黄色、蓝色、红色、粉色）。

#### Scenario: 页面整体配色
- **WHEN** 用户打开新标签页
- **THEN** 页面背景为深色（接近黑色），卡片和装饰元素使用吃豆人经典配色

### Requirement: 像素化边框和容器
所有卡片容器 SHALL 使用像素风格边框（无圆角，使用 box-shadow 模拟像素边框效果）。按钮 SHALL 采用方形设计，hover 时有像素风格高亮效果。

#### Scenario: 卡片容器像素化边框
- **WHEN** ProviderCard 渲染
- **THEN** 卡片边框为像素风格（直角、box-shadow 阶梯状边框）

#### Scenario: 按钮像素风格交互
- **WHEN** 用户将鼠标悬停在"刷新"按钮上
- **THEN** 按钮显示像素风格高亮效果（如颜色变亮、像素阴影偏移）

### Requirement: 像素风格进度条
QuotaBar 进度条 SHALL 改为像素风格渲染，使用方块填充代替平滑渐变。进度条的颜色分级逻辑（绿/橙/红）SHALL 保持不变。

#### Scenario: 进度条像素化渲染
- **WHEN** QuotaBar 显示 39% 的用量
- **THEN** 进度条以离散方块填充，绿色方块填充至 39% 位置

#### Scenario: 进度条颜色保持分级
- **WHEN** 用量超过 80%
- **THEN** 进度条方块颜色为红色，与现有逻辑一致

### Requirement: 吃豆人装饰动画
页面 SHALL 包含吃豆人主题装饰元素。至少包含一个吃豆人角色在页面中移动的 CSS 动画。装饰动画 SHALL NOT 遮挡或干扰数据展示内容。

#### Scenario: 吃豆人移动动画
- **WHEN** 用户打开新标签页
- **THEN** 页面上方或下方区域有一个像素化吃豆人角色沿水平方向移动，嘴部有开合动画

#### Scenario: 装饰不遮挡内容
- **WHEN** 吃豆人动画运行时
- **THEN** 动画元素不覆盖用量卡片或快捷链接区域，不影响用户点击交互

### Requirement: 豆子和迷宫装饰
页面 SHALL 包含吃豆人风格的小豆子（dots）装饰。可选包含简化的迷宫线条作为背景装饰。

#### Scenario: 豆子装饰展示
- **WHEN** 用户打开新标签页
- **THEN** 页面上可见像素风格的小圆点（豆子）作为装饰元素
