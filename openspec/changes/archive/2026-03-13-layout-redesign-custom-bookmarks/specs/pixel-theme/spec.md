## ADDED Requirements

### Requirement: 书签卡片像素风格
书签卡片 SHALL 保持与现有快捷链接一致的像素风格：像素边框（box-shadow 阶梯状）、像素字体图标、深色背景。悬停时 SHALL 显示对应书签颜色的高亮效果。

#### Scenario: 书签卡片渲染
- **WHEN** 书签区域渲染用户的书签
- **THEN** 每个书签以像素风格卡片呈现，包含彩色字母图标和名称标签

#### Scenario: 书签卡片悬停效果
- **WHEN** 用户将鼠标悬停在某个书签卡片上
- **THEN** 卡片显示该书签配置颜色的像素风格高亮效果

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
