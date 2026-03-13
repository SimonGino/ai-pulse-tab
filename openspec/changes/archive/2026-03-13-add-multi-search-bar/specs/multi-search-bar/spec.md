## ADDED Requirements

### Requirement: 搜索输入与跳转
搜索栏 SHALL 提供一个文本输入框，用户输入关键词后按 Enter 键 SHALL 在新标签页中打开对应搜索引擎的搜索结果页面。搜索栏 SHALL 在页面加载后自动获取焦点。

#### Scenario: Google 搜索跳转
- **WHEN** 当前引擎为 Google，用户输入 "hello world" 并按 Enter
- **THEN** 在新标签页打开 `https://www.google.com/search?q=hello%20world`

#### Scenario: Claude 搜索跳转
- **WHEN** 当前引擎为 Claude，用户输入 "explain recursion" 并按 Enter
- **THEN** 在新标签页打开 `https://claude.ai/new?q=explain%20recursion`

#### Scenario: ChatGPT 搜索跳转
- **WHEN** 当前引擎为 ChatGPT，用户输入 "what is React" 并按 Enter
- **THEN** 在新标签页打开 `https://chatgpt.com/?q=what%20is%20React`

#### Scenario: Gemini 搜索跳转
- **WHEN** 当前引擎为 Gemini，用户输入 "summarize this" 并按 Enter
- **THEN** 在新标签页打开 `https://gemini.google.com/app?q=summarize%20this`

#### Scenario: 空输入不跳转
- **WHEN** 用户在输入框为空或仅包含空白字符时按 Enter
- **THEN** 不执行任何跳转操作

#### Scenario: 页面加载自动聚焦
- **WHEN** 用户打开新标签页
- **THEN** 搜索输入框自动获取键盘焦点

### Requirement: 引擎切换
搜索栏 SHALL 支持在 Google、Claude、ChatGPT、Gemini 四个引擎之间切换。当前选中的引擎 SHALL 通过图标或标识清晰展示。

#### Scenario: 查看当前引擎
- **WHEN** 用户打开新标签页
- **THEN** 搜索栏左侧显示当前选中引擎的图标和名称标识

#### Scenario: 打开引擎选择器
- **WHEN** 用户点击搜索栏左侧的引擎图标/标识
- **THEN** 显示下拉菜单列出所有可用引擎：Google、Claude、ChatGPT、Gemini

#### Scenario: 切换引擎
- **WHEN** 用户在下拉菜单中点击 "Claude"
- **THEN** 当前引擎切换为 Claude，下拉菜单关闭，搜索栏左侧更新为 Claude 的图标/标识

#### Scenario: 点击外部关闭下拉菜单
- **WHEN** 引擎选择下拉菜单处于打开状态，用户点击菜单外部区域
- **THEN** 下拉菜单关闭

### Requirement: 引擎偏好持久化
用户选择的搜索引擎 SHALL 持久化到 `chrome.storage.local`，关闭标签页后重新打开 SHALL 恢复上次的选择。默认引擎 SHALL 为 Google。

#### Scenario: 首次使用默认 Google
- **WHEN** 用户首次安装扩展后打开新标签页
- **THEN** 搜索栏默认引擎为 Google

#### Scenario: 偏好跨会话保持
- **WHEN** 用户将引擎切换为 Gemini，然后关闭标签页
- **THEN** 重新打开新标签页时，搜索栏引擎仍为 Gemini

### Requirement: 像素风格搜索栏
搜索栏 SHALL 遵循应用的像素艺术主题，使用像素字体、像素风格边框（box-shadow）和主题色彩变量。

#### Scenario: 视觉风格一致
- **WHEN** 用户打开新标签页
- **THEN** 搜索栏使用像素字体，边框为像素风格的 box-shadow，颜色使用主题 CSS 变量（如 `--pixel-white`、`--pixel-yellow`）
