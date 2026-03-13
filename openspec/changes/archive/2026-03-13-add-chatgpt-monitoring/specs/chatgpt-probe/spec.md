## MODIFIED Requirements

### Requirement: ChatGPT Probe SHALL use credentials include for chatgpt.com
ChatGPT Probe SHALL 采用两步认证流程：首先通过 `fetch('/api/auth/session', { credentials: 'include' })` 获取 accessToken，然后使用 `Authorization: Bearer` 头调用 backend-api 端点。扩展 manifest 须声明 `host_permissions: ["https://chatgpt.com/*"]`。

#### Scenario: 两步 token 认证流程
- **WHEN** Probe 需要调用 ChatGPT API
- **THEN** SHALL 先 `GET https://chatgpt.com/api/auth/session`（credentials: include）获取 `accessToken`
- **AND** 使用 `Authorization: Bearer {accessToken}` 调用后续 API

#### Scenario: session 端点返回无 token
- **WHEN** `/api/auth/session` 返回 200 但无 `accessToken` 字段
- **THEN** Probe SHALL 返回 `not_logged_in` 状态

#### Scenario: session 端点请求失败
- **WHEN** `/api/auth/session` 返回非 200 或网络错误
- **THEN** Probe SHALL 返回 `null`（保留缓存数据）

### Requirement: ChatGPT Probe SHALL use accounts check endpoint as primary source
Probe SHALL 使用 `GET https://chatgpt.com/backend-api/accounts/check/v4-2023-04-27` 作为主端点，使用 Zod 解析响应。

#### Scenario: 成功获取账户信息
- **WHEN** accounts/check 返回 200
- **THEN** Probe SHALL 提取 `accounts` 映射中（排除 `default` 键）的账户信息
- **AND** 从 `account.plan_type` 获取计划类型
- **AND** 将 plan_type 规范化为 `free`/`plus`/`team`/`pro`

#### Scenario: plan_type 规范化
- **WHEN** `plan_type` 包含 `pro` → 规范化为 `pro`
- **WHEN** `plan_type` 包含 `team` → 规范化为 `team`
- **WHEN** `plan_type` 包含 `plus` → 规范化为 `plus`
- **WHEN** `plan_type` 为其他值 → 规范化为 `free`

#### Scenario: 端点返回错误
- **WHEN** accounts/check 返回非 200
- **THEN** Probe SHALL 返回 `null`
- **AND** 记录错误日志

### Requirement: ChatGPT Probe SHALL handle rate-limit-only data model
ChatGPT 不提供百分比用量 API。Probe SHALL 从本地存储的 `chatgptTimestamps` 读取消息时间戳，结合计划类型的配额定义计算用量百分比，通过 `ModelUsage[]` 返回各模型用量。

#### Scenario: 计算各模型用量
- **WHEN** fetchUsage 被调用且用户已认证
- **THEN** Probe SHALL 从 `chrome.storage.local` 读取 `chatgptTimestamps`
- **AND** 根据用户 plan_type 获取对应配额列表
- **AND** 为每个配额模型计算滚动窗口内的消息百分比
- **AND** 通过 `UsageData.models` 数组返回结果

#### Scenario: tooltip 展示具体数值
- **WHEN** 模型用量被计算
- **THEN** tooltip SHALL 展示 `{used}/{max} messages in {window}` 格式

## ADDED Requirements

### Requirement: ChatGPT Probe SHALL 返回 plan 字段
`UsageData.plan` 字段 SHALL 设置为规范化后的计划类型显示名（首字母大写），用于 UI 展示。

#### Scenario: 显示计划类型
- **WHEN** 用户计划为 `plus`
- **THEN** `UsageData.plan` SHALL 为 `"Plus"`
- **AND** `UsageData.orgName` SHALL 优先使用 `account.name`，若为 null 则使用计划类型显示名

### Requirement: Background Worker SHALL 并行调用多 probe 并合并结果
Background 的 `refreshUsage()` 必须并行调用 claudeProbe 和 chatgptProbe，按 provider 字段合并结果。

#### Scenario: 两个 probe 都成功
- **WHEN** 两个 probe 均返回数据
- **THEN** SHALL 合并为一个 `UsageData[]` 写入 storage

#### Scenario: ChatGPT probe 失败但 Claude 成功
- **WHEN** chatgptProbe 返回 null，claudeProbe 返回数据
- **THEN** SHALL 使用 Claude 新数据 + ChatGPT 缓存数据写入 storage

#### Scenario: 两个 probe 都失败
- **WHEN** 两个 probe 均返回 null
- **THEN** SHALL 保留完整缓存数据不变

### Requirement: ProviderCard SHALL 支持多 provider 展示
ProviderCard 组件必须接受 `loginUrl` 和 `color` props，动态生成登录链接和标题颜色。

#### Scenario: ChatGPT 卡片颜色
- **WHEN** 展示 ChatGPT 用量卡片
- **THEN** 标题指示器和文字颜色 SHALL 使用 `#10A37F`

#### Scenario: 动态登录链接
- **WHEN** 用户未认证且需要登录
- **THEN** 登录链接 SHALL 指向对应 provider 的 baseUrl

### Requirement: 扩展 manifest SHALL 声明 ChatGPT 所需权限
扩展 manifest 必须新增 `webRequest` permission 和 `https://chatgpt.com/*` host_permission。

#### Scenario: 权限声明
- **WHEN** 扩展被安装或更新
- **THEN** manifest SHALL 包含 `permissions: [..., "webRequest"]`
- **AND** `host_permissions: [..., "https://chatgpt.com/*"]`
