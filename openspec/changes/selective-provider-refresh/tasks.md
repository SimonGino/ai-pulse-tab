## 1. Background 选择性刷新

- [x] 1.1 在 `entrypoints/background.ts` 的 `refreshUsage()` 中读取 `collapsedProviders`，构建需要跳过的 Provider 名称集合
- [x] 1.2 根据折叠状态有条件地执行 Claude Probe 和 ChatGPT Probe（跳过已折叠的）
- [x] 1.3 确保被跳过的 Provider 的缓存数据在合并时保留不丢失

## 2. 单 Provider 刷新消息

- [x] 2.1 在 `entrypoints/background.ts` 中新增 `REFRESH_PROVIDER` 消息处理，接受 `providerId` 参数，只执行对应 Probe
- [x] 2.2 `REFRESH_PROVIDER` 刷新结果与缓存数据合并后写入 storage

## 3. 前端展开触发刷新

- [x] 3.1 在 `components/ProviderCard.tsx` 的展开操作中，发送 `REFRESH_PROVIDER` 消息通知 background 刷新该 Provider
- [x] 3.2 需要将 Provider ID（`claude` / `chatgpt`）传入 `ProviderCard`，用于消息中标识目标 Provider

## 4. 构建验证

- [x] 4.1 验证扩展构建无错误（`pnpm build`）
- [ ] 4.2 手动测试：折叠 Provider 后观察刷新日志确认跳过；展开后确认立即刷新
