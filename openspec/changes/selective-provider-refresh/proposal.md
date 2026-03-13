## Why

当前定时刷新和手动刷新会同时拉取所有 Provider（Claude、ChatGPT）的用量数据，即使某个 Provider 卡片已被用户折叠。折叠表示用户暂时不关注该 Provider，继续刷新是不必要的网络请求，浪费资源且增加被 API 限流的风险。

## What Changes

- **选择性刷新**：Background Service Worker 在每次刷新前读取 `collapsedProviders` 状态，跳过已折叠 Provider 的 API 请求
- **展开时立即刷新**：当用户展开一个已折叠的 Provider 卡片时，前端通知 background 立即刷新该 Provider 的数据
- **手动刷新同步**：手动点击 REFRESH 按钮时也只刷新展开中的 Provider
- **保留缓存数据**：折叠的 Provider 在展开时先显示旧缓存数据，然后立即触发刷新获取最新数据

## Capabilities

### New Capabilities
- `selective-refresh`: Background 根据 Provider 折叠状态选择性执行 API 刷新，展开时触发即时刷新

### Modified Capabilities
（无现有 spec 需要修改，折叠状态存储已在 layout-redesign-custom-bookmarks 中实现）

## Impact

- **`entrypoints/background.ts`**：刷新逻辑需要读取 `collapsedProviders` 存储键，按 Provider 过滤执行
- **`components/ProviderCard.tsx`**：展开操作需要发送 `REFRESH_PROVIDER` 消息触发单 Provider 刷新
- **消息协议**：新增 `REFRESH_PROVIDER` 消息类型（携带 provider ID）
- **无破坏性变更**：折叠/展开功能和数据结构不变，仅在刷新决策中引入过滤逻辑
