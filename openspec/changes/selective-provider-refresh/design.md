## Context

AI Pulse Tab 的后台 Service Worker 每 5 分钟通过 Chrome Alarms 触发一次 `refreshUsage()`，同时调用 Claude 和 ChatGPT 两个 Probe 拉取用量数据。前端的 `ProviderCard` 组件已支持折叠/展开并将折叠状态持久化到 `browser.storage.local` 的 `collapsedProviders` 键中（`Record<string, boolean>` 格式）。

当前刷新不感知折叠状态，每次都拉取所有 Provider 数据。

## Goals / Non-Goals

**Goals:**
- Background 定时刷新和手动刷新时跳过已折叠 Provider 的 API 请求
- 用户展开已折叠 Provider 时立即触发该 Provider 的单独刷新
- 保持已折叠 Provider 的缓存数据不丢失

**Non-Goals:**
- 不修改 Probe 本身的实现逻辑
- 不改变刷新频率（仍为 5 分钟）
- 不影响 `collapsedProviders` 的数据结构

## Decisions

### 1. Background 读取折叠状态过滤 Probe

**选择**：`refreshUsage()` 执行前先读取 `collapsedProviders`，根据 Provider ID（`claude` / `chatgpt`）与 Provider Name（`Claude` / `ChatGPT`）的映射关系判断是否跳过。

**替代方案**：
- 在前端过滤（不发送刷新消息给已折叠 Provider）→ 无法控制定时刷新，alarm 回调在 background 中
- 通过 alarm 的 create/clear 动态控制 → 过度复杂，单 alarm 已管理整体刷新周期

**理由**：最小改动，仅在 `refreshUsage()` 入口加判断逻辑。`collapsedProviders` 存储已存在，读取成本极低。

### 2. Provider ID 与 Name 映射

**选择**：`collapsedProviders` 当前以 Provider 显示名称（`Claude` / `ChatGPT`）为键存储。Background 中使用 `PROVIDERS` 常量的 `name` 字段做匹配。

**理由**：保持与 `ProviderCard` 组件的 `providerName` prop 一致，无需修改已有存储格式。

### 3. 展开时单 Provider 刷新

**选择**：新增 `REFRESH_PROVIDER` 消息类型，携带 `providerId` 字段。Background 收到后只执行指定 Provider 的 Probe。

**替代方案**：
- 展开时发 `REFRESH_NOW` 全量刷新 → 违背"只刷新需要的"初衷
- 前端直接调 Probe → Probe 依赖 background 环境（cookies、host permissions）

**理由**：复用现有消息机制，精确控制刷新范围。

### 4. 全部折叠时的行为

**选择**：如果所有 Provider 都被折叠，定时刷新直接跳过（不发任何请求），保留缓存数据。手动 REFRESH 按钮同样只刷新展开的 Provider。

**理由**：全部折叠 = 用户明确表示暂不关注，节省资源。

## Risks / Trade-offs

- **缓存数据过期** → 展开后立即触发刷新补偿，用户看到的旧数据只存在极短时间
- **Name 映射耦合** → `collapsedProviders` 的 key 与 `PROVIDERS.*.name` 必须一致；后续如添加新 Provider 需保持同步。风险极低，Provider 列表变动极少
