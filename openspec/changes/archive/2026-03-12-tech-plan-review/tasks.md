## 1. 技术方案文档修订

- [x] 1.1 修订第 9.1 节：Cookie 方案从手动 header 改为 `credentials: 'include'`，删除错误的代码示例，补充 PoC 验证结论
- [x] 1.2 修订第 5 节技术栈选型：CRXJS → WXT，补充 WXT 选型理由
- [x] 1.3 修订第 6 节项目结构：改为 WXT file-based entrypoints 布局（`src/entrypoints/`）
- [x] 1.4 修订第 5 节：去掉 Zustand，说明用 chrome.storage hook 替代
- [x] 1.5 修订第 5 节：Recharts → 轻量方案（CSS 进度条 + uPlot 或 canvas），补充 bundle size 考量

## 2. 补充缺失设计

- [x] 2.1 补充 ChatGPT Probe 完整设计：先用 PoC 验证 `chatgpt.com/backend-api/accounts/check` 的 `credentials: 'include'` 可行性，记录真实响应格式
- [x] 2.2 补充多组织展示设计：在第 8.1 节 UI 信息架构中增加多 org sub-card 方案和 org 切换/隐藏设置
- [x] 2.3 补充 Storage Schema 版本迁移机制：在第 10 节增加 `schemaVersion` 字段和迁移函数链设计
- [x] 2.4 补充测试策略章节：包括 Vitest 配置、Probe mock 方案、组件测试、CI 配置、fixtures 目录结构
- [x] 2.5 补充 CSP 兼容性说明：确认 React 19 + Vite 生产构建符合 MV3 CSP 要求
- [x] 2.6 补充 i18n 预留：在项目结构中增加 `_locales/` 目录，说明字符串管理策略

## 3. PoC 验证（未完成项）

- [x] 3.1 用现有 PoC 调用 `https://claude.ai/api/organizations/{orgId}/usage`，保存真实响应 JSON 到 `docs/claude-api-response-samples/`
- [x] 3.2 扩展 PoC 验证 ChatGPT：在 manifest 增加 `https://chatgpt.com/*` host_permission，测试 `credentials: 'include'` 对 chatgpt.com 的效果
- [x] 3.3 验证 WXT + React 19 + Tailwind CSS 4 组合：`npx wxt init` 创建最小项目，确认 dev/build 正常

## 4. 更新风险表

- [x] 4.1 修订第 12 节风险表：将 Cookie header 风险从"中"降为"已缓解"，补充 PoC 结论
- [x] 4.2 新增风险项：ChatGPT `backend-api` 端点可能需要额外 header（如 CF challenge）
- [x] 4.3 新增风险项：WXT 与特定 React/Tailwind 版本的兼容性风险
