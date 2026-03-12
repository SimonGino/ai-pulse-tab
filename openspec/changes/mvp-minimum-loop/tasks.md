## 1. 项目脚手架

- [x] 1.1 使用 `npx wxt@latest init --template react` 初始化项目（在项目根目录生成 src/、wxt.config.ts、package.json 等）
- [x] 1.2 集成 Tailwind CSS 4（安装依赖、在 CSS 入口添加 `@import "tailwindcss"`、验证类名生效）
- [x] 1.3 在 wxt.config.ts 中配置 MV3 权限（permissions: cookies/storage/alarms，host_permissions: claude.ai）
- [x] 1.4 验证 `wxt dev` 能启动、`wxt build` 能生成正确的 manifest.json

## 2. 核心类型定义

- [x] 2.1 创建 `src/core/types.ts`，定义 UsageProbe、UsageData、AuthStatus、QuotaWindow、ModelUsage 接口
- [x] 2.2 创建 `src/core/constants.ts`，定义刷新间隔（5分钟）、颜色阈值（0.5/0.8）、Provider 元信息

## 3. ClaudeProbe 实现

- [x] 3.1 创建 `src/probes/claude-probe.ts`，实现 checkAuth()（调用 /api/organizations 判断认证状态）
- [x] 3.2 实现 fetchUsage()：对每个 org 调用 /usage 和 /overage_spend_limit，归一化为 UsageData[]
- [x] 3.3 用 zod 定义 Claude API 响应 schema（organizations、usage、overage），做防御性解析

## 4. Background Service Worker

- [x] 4.1 创建 `src/entrypoints/background.ts`，在 onInstalled 中创建 chrome.alarm（refresh-usage，5分钟间隔）并立即执行首次刷新
- [x] 4.2 实现 alarm 触发的刷新逻辑：调用 ClaudeProbe → 写入 chrome.storage.local（usageData + lastUpdated）
- [x] 4.3 监听 `REFRESH_NOW` 消息，支持手动触发刷新
- [x] 4.4 实现 Probe 失败时不覆盖已有缓存的逻辑

## 5. New Tab UI 组件

- [x] 5.1 创建 `src/components/QuotaBar.tsx`：接收 used(0-1)、label，渲染 CSS 进度条 + 颜色编码（绿/橙/红）
- [x] 5.2 创建 `src/components/ResetCountdown.tsx`：接收 resetAt(Date)，显示 "Xh Ym" 格式倒计时
- [x] 5.3 创建 `src/components/ProviderCard.tsx`：展示单 Provider 用量，支持多 org sub-card 和认证状态显示
- [x] 5.4 创建 `src/hooks/useUsageData.ts`：从 chrome.storage.local 读取 usageData + lastUpdated，监听 onChanged

## 6. New Tab 页面组装

- [x] 6.1 修改 `src/entrypoints/newtab/App.tsx`：使用 useUsageData hook，渲染 ProviderCard + 最后更新时间 + 刷新按钮
- [x] 6.2 实现刷新按钮逻辑：点击后发送 REFRESH_NOW 消息，显示 loading 状态
- [x] 6.3 实现空状态和未登录状态的 UI 展示

## 7. 端到端验证

- [ ] 7.1 执行 `wxt dev`，在 Chrome 中加载插件，打开新标签页，验证能看到 Claude 真实用量数据（需手动验证）
- [ ] 7.2 验证多 org 场景：确认多个 org 的用量数据各自独立显示（需手动验证）
- [ ] 7.3 验证未登录场景：清除 claude.ai cookie 后，确认 UI 显示登录提示（需手动验证）
