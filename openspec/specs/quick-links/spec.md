## MODIFIED Requirements

### Requirement: 快捷链接区域展示
页面 SHALL 在搜索栏下方以全宽一行展示用户自定义的书签列表。书签区域 SHALL 使用水平排列布局，书签从左到右排列。书签区域末尾 SHALL 显示一个"+"添加按钮。

#### Scenario: 书签区域位置
- **WHEN** 用户打开新标签页
- **THEN** 书签栏显示在搜索栏正下方、用量卡片区域之上，占据全宽一行

#### Scenario: 书签水平排列
- **WHEN** 书签区域渲染
- **THEN** 所有书签从左到右水平排列在一行中，末尾显示"+"添加按钮

#### Scenario: 书签数量较多时换行
- **WHEN** 书签数量超过一行可容纳的数量
- **THEN** 书签自动换行到下一行，保持网格对齐

### Requirement: 预设网站列表
书签区域 SHALL 在首次使用时显示默认预设书签（Claude、ChatGPT、Douyu、X）。用户 SHALL 可以修改或删除这些默认书签，也可以添加新书签。

#### Scenario: 首次展示预设书签
- **WHEN** 用户首次安装扩展并打开新标签页
- **THEN** 书签区域显示 4 个默认书签卡片，每个包含网站名称和图标字母

#### Scenario: 用户自定义后展示
- **WHEN** 用户已删除 Douyu 并添加了 GitHub 书签
- **THEN** 书签区域显示 Claude、ChatGPT、X、GitHub 四个书签
