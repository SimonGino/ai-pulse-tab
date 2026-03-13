## ADDED Requirements

### Requirement: 扩展 SHALL 通过 webRequest 拦截 ChatGPT 对话请求
Background Service Worker 必须注册 `webRequest.onBeforeRequest` 监听器，捕获发送到 `chatgpt.com/backend-api/conversation` 和 `chatgpt.com/backend-api/*/conversation` 的 POST 请求。

#### Scenario: 成功拦截对话请求
- **WHEN** 用户在 chatgpt.com 发送一条消息
- **AND** 浏览器发出 POST 请求到 `chatgpt.com/backend-api/conversation`
- **THEN** 拦截器 SHALL 从 requestBody 中提取 `model` 字段
- **AND** 将模型 slug 映射为内部配额 ID
- **AND** 将当前时间戳记录到 `chrome.storage.local` 的 `chatgptTimestamps` 键下

#### Scenario: 项目级对话路径拦截
- **WHEN** POST 请求路径为 `chatgpt.com/backend-api/{project_id}/conversation`
- **THEN** 拦截器 SHALL 同样捕获并处理该请求

#### Scenario: requestBody 解析失败
- **WHEN** requestBody 为空、格式异常或 JSON 解析失败
- **THEN** 拦截器 SHALL 静默忽略该请求，不影响其他功能

### Requirement: 模型 slug SHALL 映射到内部配额 ID
系统必须将 ChatGPT API 模型 slug 规范化为内部配额 ID，用于时间戳分类和配额计算。

#### Scenario: GPT-5 系列模型映射
- **WHEN** 模型 slug 包含 `gpt-5`（且不含 `thinking` 或 `pro`）、`gpt-4o` 或 `chatgpt-4o`
- **THEN** SHALL 映射为 `gpt-5`

#### Scenario: 推理模型映射
- **WHEN** 模型 slug 包含 `gpt-5-thinking`、`o3` 或 `o4`
- **THEN** SHALL 映射为 `gpt-5-thinking`

#### Scenario: Pro 模型映射
- **WHEN** 模型 slug 包含 `gpt-5-pro`
- **THEN** SHALL 映射为 `gpt-5-pro`

#### Scenario: 免费用户 auto 模型
- **WHEN** 模型 slug 为 `auto`
- **THEN** SHALL 映射为 `auto`

#### Scenario: 未知模型降级
- **WHEN** 模型 slug 不匹配任何已知模式
- **THEN** SHALL 降级映射为 `gpt-5`

### Requirement: 时间戳存储 SHALL 使用模型 ID 分类
`chatgptTimestamps` 存储结构为 `Record<string, number[]>`，键为内部配额 ID，值为时间戳数组（毫秒）。

#### Scenario: 记录新消息时间戳
- **WHEN** 拦截到一条新的对话请求，模型映射为 `gpt-5`
- **THEN** SHALL 在 `chatgptTimestamps["gpt-5"]` 数组末尾追加 `Date.now()`

#### Scenario: 首次记录某模型
- **WHEN** `chatgptTimestamps` 中不存在该模型 ID 的键
- **THEN** SHALL 创建新数组 `[Date.now()]`

### Requirement: 用量计算 SHALL 基于滚动时间窗口
系统必须根据用户计划类型查找对应的配额定义，在滚动窗口内统计消息数并计算百分比。

#### Scenario: Plus 用户 GPT-5 用量计算
- **WHEN** 用户计划为 Plus，配额为 160 条/3 小时
- **AND** `chatgptTimestamps["gpt-5"]` 在过去 3 小时内有 80 条时间戳
- **THEN** SHALL 计算 `used = 80/160 = 0.5`

#### Scenario: 超出配额上限
- **WHEN** 滚动窗口内消息数超过配额上限
- **THEN** `used` SHALL 被钳制为 `1.0`（不超过 100%）

#### Scenario: 无消息记录
- **WHEN** 滚动窗口内无任何时间戳
- **THEN** `used` SHALL 为 `0`，且不设置 `resetAt`

#### Scenario: resetAt 计算
- **WHEN** 滚动窗口内有消息记录
- **THEN** `resetAt` SHALL 为最早时间戳 + 窗口时长（ISO 格式）

### Requirement: 旧时间戳 SHALL 定期清理
系统必须通过 `chrome.alarms` 每日清理超过最长窗口 1.5 倍的旧时间戳，防止存储无限增长。

#### Scenario: 每日清理过期数据
- **WHEN** 清理定时器触发
- **THEN** SHALL 删除所有超过 1080 小时（720h × 1.5）的时间戳
- **AND** 删除空数组的模型键

### Requirement: 配额定义 SHALL 按计划类型维护
系统必须维护各计划类型的模型配额映射表。

#### Scenario: 支持的计划类型
- **WHEN** 查询配额定义
- **THEN** SHALL 包含 `free`、`plus`、`team`、`pro` 四种计划类型
- **AND** 每种计划包含至少一个模型的 `{ id, label, max, hours }` 配置
