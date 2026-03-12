## Why

`ai-usage-newtab-tech-plan.md` 整体质量不错，架构分层、竞品分析、Provider 接口设计都到位。但有 **2 个技术选型需修正**（已通过 PoC 验证）、**5 个重要缺失**需要补齐，否则 Phase 1 开工后会频繁返工。

## What Changes

### 已验证需修正

1. **Cookie 方案改用 `credentials: 'include'`** — PoC 已证实手动设 Cookie header 在 MV3 返回 403，`credentials: 'include'` + `host_permissions` 直接可用。计划第 9.1 节需全面改写
2. **构建工具 CRXJS → WXT** — CRXJS 对 Vite 6 兼容性差且维护停滞，WXT (wxt.dev) 活跃维护、原生支持 MV3、内置 HMR，且自带 storage/messaging 工具函数

### 重要缺失需补充

3. **ChatGPT Probe 欠设计** — Claude Probe 有完整端点+响应格式+伪代码，ChatGPT 只有一句模糊描述。需研究 `chatgpt.com/backend-api/accounts/check` 等实际端点
4. **测试策略缺失** — 无任何测试规划。Probe 需要 mock 测试（不可能用真 cookie 跑 CI），UI 需要组件测试
5. **Bundle Size 未评估** — New Tab 要求 <200ms 可交互，但 React + Recharts (~150KB gz) + Zustand + Tailwind 未做 size budget。建议进度条用 CSS、图表用轻量库
6. **多组织处理未设计** — PoC 已证实 Claude 返回多个 org（Personal + Team），计划没说如何展示/切换
7. **Storage Schema 无版本迁移** — `StorageSchema` 没有 version 字段，插件更新后 schema 变更会丢数据

### 优化建议

8. **Zustand 可能多余** — 数据流是 `chrome.storage → useEffect → state`，已有 `useUsageData` hook，不需要额外 store 层
9. **缺 CSP 兼容性确认** — MV3 严格限制 CSP，需确认 React 生产构建不依赖 `eval()` 或 `unsafe-inline`
10. **i18n 目录应从 Phase 1 预留** — `chrome.i18n` 的 `_locales/` 结构应提前建好，避免后期改造字符串

## Capabilities

### New Capabilities

- `cookie-auth`: MV3 下基于 credentials:include 的 Cookie 认证方案
- `build-toolchain`: WXT 构建工具链配置与项目结构
- `claude-probe`: Claude API 端点调用、响应解析、多组织处理
- `chatgpt-probe`: ChatGPT 端点研究、认证方案、响应解析
- `testing`: 测试策略 — Probe mock、组件测试、CI 方案

### Modified Capabilities

（尚无已有 specs）

## Impact

- **技术选型变更**：CRXJS → WXT，项目结构从 manifest-centric 改为 file-based entrypoints
- **API 调用方式变更**：去掉手动 Cookie header，统一用 `credentials: 'include'`
- **可能去掉的依赖**：Zustand（用 hook 替代）、Recharts（用轻量方案替代）
- **新增内容**：测试框架配置、Storage 版本迁移机制、多 org 切换 UI
