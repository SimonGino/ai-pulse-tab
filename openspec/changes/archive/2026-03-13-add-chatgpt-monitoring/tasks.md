## 1. 基础配置与权限

- [x] 1.1 `core/constants.ts`：新增 ChatGPT provider 配置（id、name、color、baseUrl）和 `chatgptTimestamps` storage key，新增 `CLEANUP_ALARM_NAME` 常量
- [x] 1.2 `wxt.config.ts`：permissions 中新增 `webRequest`，host_permissions 中新增 `https://chatgpt.com/*`

## 2. ChatGPT Probe 实现

- [x] 2.1 创建 `probes/chatgpt-probe.ts`：定义 Zod schema（SessionSchema、AccountSchema、EntitlementSchema、AccountEntrySchema、AccountsCheckSchema）
- [x] 2.2 实现 `getAccessToken()`：通过 `/api/auth/session` 获取 access token
- [x] 2.3 实现 `fetchAccountsCheck(token)`：调用 `accounts/check/v4-2023-04-27` 端点并解析响应
- [x] 2.4 实现 `mapModelSlug(slug)`：将 API 模型 slug 映射到内部配额 ID（gpt-5、gpt-5-thinking、gpt-5-pro、auto）
- [x] 2.5 实现 `normalizePlanType(raw)`：将 plan_type 规范化为 free/plus/team/pro
- [x] 2.6 定义 `PLAN_QUOTAS` 配额表：按计划类型维护各模型的 `{ id, label, max, hours }` 配置
- [x] 2.7 实现 `chatgptProbe.checkAuth()`：两步认证检查，返回 AuthStatus
- [x] 2.8 实现 `chatgptProbe.fetchUsage()`：读取时间戳、计算滚动窗口用量、返回 UsageData[]

## 3. Background Worker 更新

- [x] 3.1 实现 ChatGPT 消息拦截器：`webRequest.onBeforeRequest` 监听 conversation POST 请求，提取模型并记录时间戳
- [x] 3.2 实现 `recordTimestamp(modelId)`：将时间戳写入 `chatgptTimestamps` storage
- [x] 3.3 实现 `cleanupOldTimestamps()`：清理超过 1080h 的旧时间戳，注册每日清理定时器
- [x] 3.4 更新 `refreshUsage()`：并行调用 claudeProbe 和 chatgptProbe（Promise.allSettled），按 provider 合并结果，保留失败 probe 的缓存数据

## 4. UI 组件更新

- [x] 4.1 `components/ProviderCard.tsx`：新增 `loginUrl` 和 `color` props，OrgCard 动态生成登录链接和颜色，新增 plan 字段展示
- [x] 4.2 `entrypoints/newtab/App.tsx`：按 provider 过滤数据，分别渲染 Claude 和 ChatGPT 的 ProviderCard，更新空状态展示

## 5. 验证

- [x] 5.1 执行 `npm run build` 确认编译通过，检查输出 manifest.json 权限正确
- [ ] 5.2 手动测试：加载扩展到 Chrome，验证 ChatGPT 登录检测和卡片展示
