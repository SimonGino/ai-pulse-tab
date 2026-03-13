## Context

AI Pulse Tab 当前只集成了 Claude probe，通过 `claude.ai/api/organizations/{id}/usage` 获取百分比用量。现在需要加入 ChatGPT 监控，但 ChatGPT 的技术限制完全不同：没有公开的用量百分比 API，需要客户端拦截和本地计数。

现有架构：`UsageProbe` 接口 → `background.ts` 定时调用 → `chrome.storage.local` 缓存 → React 新标签页渲染。

## Goals / Non-Goals

**Goals:**
- 在 New Tab 页面同时展示 Claude 和 ChatGPT 的用量
- 检测 ChatGPT 登录状态和计划类型（Free/Plus/Team/Pro）
- 通过 webRequest 拦截本地追踪 ChatGPT 消息发送量
- 按模型和滚动时间窗口计算用量百分比
- 两个 probe 互不影响：一个失败不丢失另一个的缓存数据

**Non-Goals:**
- 不做远程配额配置（v1 先硬编码，后续迭代可加远程 quota.json）
- 不追踪历史数据（只从安装/更新后开始计数）
- 不在 ChatGPT 页面内注入 UI（只在 New Tab 展示）

## Decisions

### D1: ChatGPT 认证采用两步 token 流程

**选择**：先 `GET /api/auth/session`（cookie 认证）获取 accessToken，再用 `Authorization: Bearer` 调用 `backend-api/accounts/check`。

**备选方案**：直接 `credentials: 'include'` 调用 backend-api → 不可行，ChatGPT 的 backend-api 端点要求 Bearer token 而非 cookie。

**依据**：社区多个开源扩展（BrainyAI、ChatALL、chatgpt-multimodal-exporter）均采用相同流程。

### D2: 用量追踪采用 webRequest 拦截 + 本地时间戳计数

**选择**：使用 `browser.webRequest.onBeforeRequest` 监听 `POST chatgpt.com/backend-api/conversation`，从 requestBody 提取模型 slug，记录时间戳到 `chrome.storage.local`。

**备选方案 A**：解析 `accounts/check` 的 `rate_limits` 字段 → 该字段实际为空数组，不可用。
**备选方案 B**：拦截响应头中的 rate limit 信息 → ChatGPT 不在响应头中返回使用量。

**依据**：chatgpt-usage-limit-tracker 扩展验证了此方案可行，是目前唯一能获取使用量数据的方式。

### D3: 配额上限按计划类型硬编码

**选择**：在代码中维护 `PLAN_QUOTAS` 映射表（Free/Plus/Team/Pro → 各模型配额），v1 基于 chatgpt-usage-limit-tracker 的 quota.json 数据。

**依据**：
- 配额变化频率低（每季度约一次）
- 远程配置增加依赖和复杂度
- 后续可轻松改为远程 fetch

### D4: 模型 slug 规范化映射

**选择**：将 API 模型 slug（如 `gpt-5`, `chatgpt-4o-latest`, `o3`）映射到内部配额 ID（`gpt-5`, `gpt-5-thinking`, `gpt-5-pro`, `auto`）。

映射规则：
- `*gpt-5-pro*` → `gpt-5-pro`
- `*gpt-5-thinking*` → `gpt-5-thinking`
- `*gpt-5*`, `*gpt-4o*`, `*chatgpt-4o*` → `gpt-5`
- `*o3*`, `*o4*` → `gpt-5-thinking`（推理模型共享配额）
- `auto` → `auto`
- 其他 → `gpt-5`（降级到主模型配额）

### D5: 多 probe 合并策略

**选择**：`refreshUsage()` 并行调用两个 probe（`Promise.allSettled`），按 provider 合并结果。某个 probe 失败时保留该 provider 的缓存数据。

**依据**：避免 ChatGPT 未登录导致 Claude 数据丢失，反之亦然。

### D6: ProviderCard 组件泛化

**选择**：为 ProviderCard 新增 `loginUrl` 和 `color` props，OrgCard 动态生成登录链接。新增 `plan` 字段显示计划类型。

**备选方案**：为 ChatGPT 创建独立组件 → 不必要，数据结构一致，复用更合理。

## Risks / Trade-offs

- **[用量数据不含历史]** 安装后才开始追踪，无法获取已有消息计数 → 可接受，新标签页明确标注追踪起始点
- **[配额数据可能过时]** OpenAI 调整模型配额时硬编码值会不准确 → 后续版本可加远程配置；当前足够准确
- **[新增 webRequest 权限]** 更新时需要用户重新授权 → 权限范围明确（仅 chatgpt.com），隐私影响可控
- **[MV3 Service Worker 生命周期]** Worker 可能被终止 → webRequest listener 在 worker 重启时重新注册，不会丢失监听
- **[requestBody 解析失败]** 请求体过大或格式异常 → try-catch 静默处理，不影响其他功能
