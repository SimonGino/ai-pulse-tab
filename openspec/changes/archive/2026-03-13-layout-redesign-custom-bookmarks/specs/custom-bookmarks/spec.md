## ADDED Requirements

### Requirement: 书签数据模型
系统 SHALL 使用以下数据结构存储每个书签：id（唯一标识）、name（显示名称）、url（目标地址）、letter（图标字母）、color（图标颜色）、order（排序序号）。

#### Scenario: 书签数据完整性
- **WHEN** 用户添加一个新书签
- **THEN** 系统生成唯一 id，自动从 name 提取首字母作为 letter，分配默认颜色，order 设为当前最大值 +1

### Requirement: 书签持久化存储
书签数据 SHALL 通过 `browser.storage.local` 持久化，使用 `bookmarks` 作为存储键。书签数据 SHALL 在浏览器重启后保留。

#### Scenario: 书签数据持久化
- **WHEN** 用户添加书签后关闭浏览器并重新打开新标签页
- **THEN** 之前添加的书签仍然显示

#### Scenario: 存储键命名
- **WHEN** 系统读写书签数据
- **THEN** 使用 `bookmarks` 作为 `browser.storage.local` 的键名

### Requirement: 默认书签初始化
系统 SHALL 在首次安装或升级时（检测到 `bookmarks` 键不存在），自动写入默认书签列表：Claude (claude.ai)、ChatGPT (chatgpt.com)、Douyu (douyu.com)、X (x.com)。

#### Scenario: 首次安装初始化
- **WHEN** 用户首次安装扩展并打开新标签页
- **THEN** 书签区域显示 4 个默认书签

#### Scenario: 已有书签不覆盖
- **WHEN** 用户已自定义书签后扩展更新
- **THEN** 系统检测到 `bookmarks` 键已存在，不覆盖用户数据

### Requirement: 添加书签
用户 SHALL 能够通过点击"+"按钮添加新书签。添加时 SHALL 弹出 Modal 表单，要求输入书签名称（必填）和 URL（必填）。

#### Scenario: 添加书签流程
- **WHEN** 用户点击书签区域的"+"按钮
- **THEN** 弹出 Modal 表单，包含名称输入框、URL 输入框、颜色选择器和确认/取消按钮

#### Scenario: 添加书签成功
- **WHEN** 用户填写名称 "GitHub" 和 URL "https://github.com" 并点击确认
- **THEN** 新书签立即出现在书签网格中，数据持久化到存储

#### Scenario: 添加书签验证
- **WHEN** 用户未填写名称或 URL 就点击确认
- **THEN** 表单显示验证错误提示，不允许提交

### Requirement: 编辑书签
用户 SHALL 能够编辑已有书签的名称、URL、图标字母和颜色。

#### Scenario: 进入编辑模式
- **WHEN** 用户右键点击一个已有书签
- **THEN** 显示上下文菜单，包含"编辑"和"删除"选项

#### Scenario: 编辑书签内容
- **WHEN** 用户选择"编辑"并修改名称为 "My GitHub"
- **THEN** 书签名称更新为 "My GitHub"，变更持久化到存储

### Requirement: 删除书签
用户 SHALL 能够删除不需要的书签。删除操作 SHALL 要求确认。

#### Scenario: 删除书签流程
- **WHEN** 用户右键点击书签并选择"删除"
- **THEN** 弹出确认提示

#### Scenario: 确认删除
- **WHEN** 用户确认删除
- **THEN** 书签从网格中移除，变更持久化到存储

#### Scenario: 取消删除
- **WHEN** 用户取消删除
- **THEN** 书签保留不变

### Requirement: 颜色预设选择
添加/编辑书签时 SHALL 提供预设颜色板供用户选择图标颜色，预设颜色 SHALL 与像素主题协调。

#### Scenario: 颜色选择器展示
- **WHEN** 用户在添加/编辑 Modal 中查看颜色选项
- **THEN** 显示至少 8 种预设颜色供选择，包含像素主题中的经典色彩
