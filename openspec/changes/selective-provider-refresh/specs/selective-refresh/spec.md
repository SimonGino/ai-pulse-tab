## ADDED Requirements

### Requirement: 定时刷新跳过折叠 Provider
Background Service Worker 的定时刷新 SHALL 在执行前读取 `collapsedProviders` 存储状态，已折叠的 Provider SHALL 被跳过，不执行对应的 API Probe 请求。

#### Scenario: 单个 Provider 折叠
- **WHEN** 用户折叠了 ChatGPT 卡片，5 分钟定时刷新触发
- **THEN** 只执行 Claude Probe，不执行 ChatGPT Probe，ChatGPT 的缓存数据保持不变

#### Scenario: 全部 Provider 折叠
- **WHEN** 用户折叠了所有 Provider 卡片，定时刷新触发
- **THEN** 不执行任何 Probe 请求，缓存数据保持不变

#### Scenario: 无折叠状态
- **WHEN** `collapsedProviders` 不存在或为空对象，定时刷新触发
- **THEN** 所有 Provider 的 Probe 均正常执行（与现有行为一致）

### Requirement: 手动刷新尊重折叠状态
用户点击 REFRESH 按钮发送的手动刷新请求 SHALL 同样跳过已折叠的 Provider。

#### Scenario: 手动刷新时部分折叠
- **WHEN** Claude 卡片已折叠，用户点击 REFRESH 按钮
- **THEN** 只刷新 ChatGPT 数据，Claude 缓存数据不变

### Requirement: 展开时立即刷新
当用户展开一个已折叠的 Provider 卡片时，系统 SHALL 立即触发该 Provider 的单独刷新。

#### Scenario: 展开触发刷新
- **WHEN** 用户将已折叠的 Claude 卡片展开
- **THEN** 系统立即发送 `REFRESH_PROVIDER` 消息，Background 只执行 Claude Probe 并更新数据

#### Scenario: 展开后数据更新
- **WHEN** Claude 卡片被折叠了 30 分钟后展开
- **THEN** 先显示 30 分钟前的缓存数据，随后刷新完成时自动更新为最新数据

### Requirement: 缓存数据保留
折叠 Provider 的已有缓存数据 SHALL 在刷新周期中保持不变，不被清除或覆盖。

#### Scenario: 折叠期间缓存不丢失
- **WHEN** ChatGPT 被折叠，经过多个刷新周期
- **THEN** ChatGPT 的缓存用量数据始终保留，展开后可立即显示
