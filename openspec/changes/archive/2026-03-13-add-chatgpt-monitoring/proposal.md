## Why

AI Pulse Tab 目前只监控了 Claude 的用量配额，但用户同时也在使用 ChatGPT。为了实现"AI 用量仪表盘"的完整闭环，需要将 ChatGPT 的用量监控也纳入扩展。

## What Changes

- **新增 ChatGPT 认证检测**：通过 `/api/auth/session` 获取 access token，再调用 `accounts/check` 端点获取账户计划类型和订阅状态
- **新增 ChatGPT 消息用量追踪**：通过 `webRequest.onBeforeRequest` 拦截 `POST backend-api/conversation` 请求，从 requestBody 中提取模型 slug，本地记录每条消息的时间戳
- **新增用量计算**：根据用户计划类型（Free/Plus/Team/Pro）匹配已知配额上限，在滚动时间窗口内计算消息数占比
- **更新 UI**：在 New Tab 页面同时展示 Claude 和 ChatGPT 的用量卡片，ProviderCard 组件支持动态颜色和登录链接
- **更新 Background Worker**：并行调用两个 probe，合并结果存入 storage，互不影响缓存
- **新增权限**：增加 `webRequest` 权限和 `https://chatgpt.com/*` host_permission

## Capabilities

### New Capabilities
- `chatgpt-message-tracking`: 通过 webRequest 拦截 ChatGPT 对话请求，本地记录消息时间戳并按模型分类计算滚动窗口用量

### Modified Capabilities
- `chatgpt-probe`: 补充完整的认证流程（两步 token 获取）、Zod schema 定义、按计划类型计算用量的具体需求

## Impact

- **新增权限**：`webRequest` permission + `https://chatgpt.com/*` host_permission，用户更新扩展时需要重新授权
- **修改文件**：`core/constants.ts`、`entrypoints/background.ts`、`wxt.config.ts`、`components/ProviderCard.tsx`、`entrypoints/newtab/App.tsx`
- **新增文件**：`probes/chatgpt-probe.ts`
- **依赖**：无新增 npm 依赖（复用现有的 zod）
- **存储**：新增 `chatgptTimestamps` 键存储消息时间戳
