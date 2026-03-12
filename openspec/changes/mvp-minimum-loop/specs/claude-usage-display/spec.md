## ADDED Requirements

### Requirement: Background SHALL 使用 chrome.alarms 定时刷新
Background Service Worker SHALL 在 `chrome.runtime.onInstalled` 时创建名为 `refresh-usage` 的 alarm，间隔 5 分钟触发一次数据刷新。

#### Scenario: 插件安装后自动开始刷新
- **WHEN** 插件安装或更新
- **THEN** SHALL 创建 `refresh-usage` alarm，`periodInMinutes` 为 5
- **AND** SHALL 立即执行一次数据刷新

#### Scenario: Alarm 触发数据刷新
- **WHEN** `refresh-usage` alarm 触发
- **THEN** Background SHALL 调用 ClaudeProbe.fetchUsage()
- **AND** SHALL 将结果写入 `chrome.storage.local`

### Requirement: Background SHALL 支持手动刷新消息
Background SHALL 监听 `{ type: 'REFRESH_NOW' }` 消息，收到后立即执行一次数据刷新。

#### Scenario: New Tab 触发手动刷新
- **WHEN** New Tab 发送 `chrome.runtime.sendMessage({ type: 'REFRESH_NOW' })`
- **THEN** Background SHALL 立即执行 ClaudeProbe.fetchUsage() 并更新 storage

### Requirement: Storage SHALL 存储归一化的用量数据
`chrome.storage.local` SHALL 存储 `usageData`（UsageData 数组）和 `lastUpdated`（时间戳）两个键。

#### Scenario: 刷新后数据写入 storage
- **WHEN** ClaudeProbe 成功获取用量数据
- **THEN** storage SHALL 包含 `usageData` 键，值为 UsageData 数组
- **AND** storage SHALL 包含 `lastUpdated` 键，值为当前时间戳

#### Scenario: Probe 失败不覆盖已有缓存
- **WHEN** ClaudeProbe.fetchUsage() 返回 null（API 失败）
- **THEN** storage 中已有的 `usageData` SHALL 保持不变
- **AND** `lastUpdated` SHALL 不更新

### Requirement: New Tab SHALL 从 storage 读取并渲染用量数据
New Tab 页面 SHALL 在挂载时从 `chrome.storage.local` 读取 `usageData`，并监听 `onChanged` 事件实时更新。

#### Scenario: 有缓存数据时渲染卡片
- **WHEN** New Tab 打开且 storage 中有 usageData
- **THEN** SHALL 渲染 Claude Provider 卡片，显示 session 和 weekly 进度条

#### Scenario: 无缓存数据时显示加载状态
- **WHEN** New Tab 打开但 storage 中无 usageData
- **THEN** SHALL 显示加载/空状态提示

### Requirement: ProviderCard SHALL 展示多 org 用量
当 Claude 账户有多个 organization 时，ProviderCard SHALL 为每个 org 显示独立的 sub-card。

#### Scenario: 双 org 用户
- **WHEN** usageData 包含 Personal org（session 65%）和 Team org（session 20%）
- **THEN** SHALL 渲染两个 sub-card，各自显示 org 名称和独立进度条

#### Scenario: 单 org 用户
- **WHEN** usageData 只包含一个 org
- **THEN** SHALL 直接展示用量数据，不显示 org 名称包裹层

### Requirement: QuotaBar SHALL 根据用量百分比渲染进度条
QuotaBar 组件 SHALL 接收 `used`（0-1）参数，渲染对应宽度的进度条，并根据阈值变色。

#### Scenario: 低用量显示绿色
- **WHEN** `used` < 0.5
- **THEN** 进度条 SHALL 使用绿色样式

#### Scenario: 中用量显示橙色
- **WHEN** 0.5 <= `used` < 0.8
- **THEN** 进度条 SHALL 使用橙色样式

#### Scenario: 高用量显示红色
- **WHEN** `used` >= 0.8
- **THEN** 进度条 SHALL 使用红色样式

### Requirement: ResetCountdown SHALL 显示重置倒计时
ResetCountdown 组件 SHALL 接收 `resetAt`（Date）参数，显示距离重置的剩余时间（如 "2h 31m"）。

#### Scenario: 正常倒计时
- **WHEN** resetAt 在 2 小时 31 分后
- **THEN** SHALL 显示 "2h 31m"

#### Scenario: 已过重置时间
- **WHEN** resetAt 早于当前时间
- **THEN** SHALL 显示 "重置中..." 或类似提示

### Requirement: New Tab SHALL 显示认证状态
当 Claude 未登录或 session 过期时，New Tab SHALL 显示对应的认证状态提示。

#### Scenario: 未登录状态
- **WHEN** ClaudeProbe 返回 `AuthStatus { status: 'not_logged_in' }`
- **THEN** SHALL 显示 "请登录 claude.ai" 并提供跳转链接

#### Scenario: Session 过期
- **WHEN** ClaudeProbe 返回 `AuthStatus { status: 'expired' }`
- **THEN** SHALL 显示 "请重新登录 claude.ai" 并提供跳转链接

### Requirement: New Tab SHALL 显示最后更新时间和手动刷新按钮
页面底部 SHALL 显示数据的最后更新时间（相对时间，如 "2 分钟前"），以及一个手动刷新按钮。

#### Scenario: 点击刷新按钮
- **WHEN** 用户点击刷新按钮
- **THEN** SHALL 发送 `REFRESH_NOW` 消息给 Background
- **AND** 按钮 SHALL 显示 loading 状态直到 storage 更新
