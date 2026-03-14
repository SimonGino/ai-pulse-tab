## ADDED Requirements

### Requirement: 搜索建议实时获取

系统必须（SHALL）在用户输入搜索关键词时，通过当前选中搜索引擎的 Suggest API 实时获取搜索建议。请求必须（MUST）在用户停止输入 300ms 后发起（防抖）。输入少于 2 个字符时不发起请求。

#### Scenario: 用户输入触发建议请求

- **WHEN** 用户在搜索栏输入 "react" 并停止输入 300ms，当前引擎为 Google
- **THEN** 系统向 Google Suggest API 发起请求，获取包含 "react" 的建议列表

#### Scenario: 输入过短不触发请求

- **WHEN** 用户在搜索栏输入单个字符 "r"
- **THEN** 系统不发起建议请求，不显示建议列表

#### Scenario: 快速连续输入只触发一次请求

- **WHEN** 用户在 300ms 内依次输入 "r"、"re"、"rea"、"reac"、"react"
- **THEN** 系统仅在最后一次输入 "react" 后 300ms 发起一次请求，之前的输入不触发请求

#### Scenario: 新请求取消旧请求

- **WHEN** 用户输入 "react" 触发请求，在请求返回前继续输入变为 "react native"
- **THEN** 系统取消 "react" 的请求，仅处理 "react native" 的请求结果

### Requirement: 建议列表展示

系统必须（SHALL）将获取到的搜索建议以下拉列表形式展示在搜索栏下方。列表最多显示 8 条建议。当没有建议或请求失败时，不显示列表。

#### Scenario: 正常展示建议列表

- **WHEN** Suggest API 返回 10 条建议
- **THEN** 系统在搜索栏下方展示前 8 条建议，列表采用像素风格样式

#### Scenario: 请求失败静默处理

- **WHEN** Suggest API 请求超时或返回错误
- **THEN** 系统不显示建议列表，不展示错误信息，用户可正常继续输入和搜索

#### Scenario: 输入清空后关闭建议列表

- **WHEN** 用户清空搜索栏内容
- **THEN** 建议列表立即关闭

### Requirement: 键盘导航建议列表

系统必须（SHALL）支持通过键盘操作建议列表：↑/↓ 箭头键在建议项之间移动高亮，Enter 键选中当前高亮项并执行搜索，Esc 键关闭建议列表。

#### Scenario: 上下箭头导航

- **WHEN** 建议列表展示中，用户按 ↓ 箭头键
- **THEN** 高亮移动到下一条建议；若已在最后一条，高亮回到第一条（循环）

#### Scenario: Enter 选中建议

- **WHEN** 用户通过 ↓ 箭头高亮某条建议后按 Enter
- **THEN** 搜索栏内容替换为该建议文本，并立即执行搜索（在新标签页打开）

#### Scenario: Esc 关闭建议列表

- **WHEN** 建议列表展示中，用户按 Esc
- **THEN** 建议列表关闭，搜索栏保留当前输入文本，焦点保持在搜索栏

#### Scenario: 无高亮时 Enter 执行原始查询

- **WHEN** 建议列表展示中但没有任何高亮项，用户按 Enter
- **THEN** 系统使用搜索栏当前输入文本执行搜索（保持原有行为）

### Requirement: 鼠标点击建议

系统必须（SHALL）支持用户通过鼠标点击建议项来选中并执行搜索。

#### Scenario: 点击建议项执行搜索

- **WHEN** 用户鼠标点击建议列表中的某条建议
- **THEN** 搜索栏内容替换为该建议文本，并立即执行搜索（在新标签页打开）

#### Scenario: 点击建议列表外部关闭列表

- **WHEN** 建议列表展示中，用户点击搜索栏和建议列表以外的区域
- **THEN** 建议列表关闭

### Requirement: 不支持建议的引擎处理

系统必须（SHALL）对不提供 Suggest API 的搜索引擎（如 Perplexity）不展示建议列表。

#### Scenario: Perplexity 引擎无建议

- **WHEN** 用户选择 Perplexity 作为搜索引擎并输入文本
- **THEN** 系统不发起建议请求，不显示建议列表，搜索栏行为与原来一致

#### Scenario: 切换到不支持建议的引擎

- **WHEN** 建议列表展示中，用户从 Google 切换到 Perplexity
- **THEN** 建议列表立即关闭

### Requirement: 搜索引擎 Suggest API 权限

浏览器扩展 manifest 必须（MUST）包含 Suggest API 所需域名的 `host_permissions`，以允许跨域请求。

#### Scenario: manifest 包含所需权限

- **WHEN** 扩展安装后用户使用搜索建议功能
- **THEN** Suggest API 请求能正常发出和返回，不被 CORS 策略阻止
