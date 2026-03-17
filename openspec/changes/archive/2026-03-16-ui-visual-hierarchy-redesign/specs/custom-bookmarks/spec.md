## MODIFIED Requirements

### Requirement: 书签数据模型
系统 SHALL 使用以下数据结构存储每个书签：id（唯一标识）、name（显示名称）、url（目标地址）、order（排序序号）。`letter` 和 `color` 字段 SHALL 为 optional，保留用于向后兼容已有数据。新增书签不再需要 letter 和 color。

#### Scenario: 新增书签数据
- **WHEN** 用户添加一个新书签
- **THEN** 系统生成唯一 id，order 设为当前最大值 +1，不要求 letter 和 color

#### Scenario: 旧书签数据兼容
- **WHEN** 系统读取包含 letter 和 color 字段的旧版书签数据
- **THEN** 系统正常加载，letter 作为 favicon fallback 使用，color 字段被忽略

### Requirement: 添加书签
用户 SHALL 能够通过点击 "+" 按钮添加新书签。添加时 SHALL 弹出 Modal 表单，仅要求输入书签名称（必填）和 URL（必填）。不再包含颜色选择器和字母输入。

#### Scenario: 添加书签流程
- **WHEN** 用户点击书签区域的 "+" 按钮
- **THEN** 弹出 Modal 表单，仅包含名称输入框、URL 输入框和确认/取消按钮

#### Scenario: 添加书签成功
- **WHEN** 用户填写名称 "GitHub" 和 URL "https://github.com" 并点击确认
- **THEN** 新书签立即出现在书签行中，显示 GitHub 的 favicon 和灰色名称

#### Scenario: 添加书签验证
- **WHEN** 用户未填写名称或 URL 就点击确认
- **THEN** 表单显示验证错误提示，不允许提交

### Requirement: 编辑书签
用户 SHALL 能够编辑已有书签的名称和 URL。不再支持编辑图标字母和颜色。

#### Scenario: 进入编辑模式
- **WHEN** 用户右键点击一个已有书签
- **THEN** 显示上下文菜单，包含 "编辑" 和 "删除" 选项

#### Scenario: 编辑书签内容
- **WHEN** 用户选择 "编辑" 并修改名称为 "My GitHub"
- **THEN** 书签名称更新为 "My GitHub"，变更持久化到存储
