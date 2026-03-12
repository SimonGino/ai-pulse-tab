## Context

项目 `ai-pulse-tab` 有一份完整的技术方案 (`ai-usage-newtab-tech-plan.md`)，经 PoC 验证发现两个关键技术选型需要修正（Cookie 方案、构建工具），同时有多项缺失需补齐。本设计文档定义修订方向和技术决策。

当前状态：项目尚未开始编码，只有技术方案文档和一个 PoC 验证目录。

## Goals / Non-Goals

**Goals:**
- 修正计划中已验证不可行的技术方案（Cookie header、CRXJS）
- 补齐缺失的关键设计（ChatGPT Probe、测试策略、多 org、schema 迁移）
- 优化技术选型减少不必要的依赖

**Non-Goals:**
- 不重写整份技术方案，只针对需修正和缺失的部分
- 不涉及 UI 设计变更（信息架构、主题等保持原方案）
- 不涉及 Phase 2+ 的功能规划

## Decisions

### D1: Cookie 认证统一用 `credentials: 'include'`

**选择**：所有 Probe 的 fetch 请求使用 `credentials: 'include'`，配合 `host_permissions` 让浏览器自动附带 cookie。

**放弃方案**：
- 手动设置 `Cookie` header → PoC 验证返回 403，MV3 会静默剥离 forbidden header
- `declarativeNetRequest` 动态注入 → 过于复杂，且有规则数量限制和竞态风险
- Offscreen document 代理 → 作为最终降级方案保留，但不作为主路径

**影响**：计划第 9.1 节需全面改写，Probe 伪代码中所有手动 Cookie 构造需移除。

### D2: 构建工具改用 WXT

**选择**：WXT (wxt.dev) 替代 CRXJS。

**理由**：
- CRXJS 维护停滞，对 Vite 6 有已知兼容性问题
- WXT 活跃维护，原生 MV3 支持，内置 HMR
- WXT 自带 `storage` 和 `messaging` 工具函数，可简化 ProviderManager 和 useUsageData
- WXT 内置跨浏览器支持，利于后续 Firefox 适配（Phase 4）

**项目结构变更**（file-based entrypoints）：
```
src/
├── entrypoints/
│   ├── background.ts        # Service Worker
│   ├── newtab/              # New Tab 页面
│   │   ├── index.html
│   │   ├── App.tsx
│   │   └── components/
│   └── options/             # 设置页
├── core/                    # Domain 层不变
├── probes/                  # Infrastructure 层不变
└── utils/
```

### D3: 去掉 Zustand，用 chrome.storage hook

**选择**：不引入 Zustand，直接用 `useUsageData` hook + `chrome.storage.local`。

**理由**：数据流只有一条路径 `background 写 storage → newtab 读 storage`，没有跨组件共享复杂状态的场景。WXT 的 `storage` 工具自带响应式，进一步简化了这个链路。

### D4: 图表库轻量化

**选择**：进度条用纯 CSS，7 日趋势图用 `<canvas>` 手绘或 uPlot (~10KB)。Phase 1 不引入 Recharts。

**理由**：Recharts ~150KB gzipped，对 New Tab <200ms 可交互的目标过重。进度条本身就是一个 div + width%，不需要图表库。

### D5: Storage Schema 增加版本号 + 迁移机制

**选择**：`StorageSchema` 增加 `schemaVersion: number` 字段，background 启动时检查版本并执行迁移函数链。

```typescript
const CURRENT_SCHEMA_VERSION = 1

const migrations: Record<number, (data: any) => any> = {
  // 0 → 1: 初始版本，无需迁移
  // 1 → 2: 示例 — 未来添加
}

async function migrateStorage() {
  const { schemaVersion = 0 } = await chrome.storage.local.get('schemaVersion')
  let data = await chrome.storage.local.get(null)
  for (let v = schemaVersion; v < CURRENT_SCHEMA_VERSION; v++) {
    if (migrations[v]) data = migrations[v](data)
  }
  await chrome.storage.local.set({ ...data, schemaVersion: CURRENT_SCHEMA_VERSION })
}
```

### D6: 多组织展示策略

**选择**：默认显示所有 org 的用量，每个 org 一个 sub-card。用户可在设置中选择隐藏某些 org。

**理由**：PoC 显示用户可能有 Personal org + Team org，两个 org 的配额独立，都有查看价值。

## Risks / Trade-offs

- **`credentials: 'include'` 发送所有 cookie** → 无法只发 sessionKey，会带上 claude.ai 的所有 cookie。风险低，因为请求目标就是 claude.ai 自己的 API。
- **WXT 学习成本** → 团队需适应 file-based entrypoints 模式。但 WXT 文档完善，迁移成本 < 1 天。
- **去掉 Zustand 后状态管理能力** → 如果未来 UI 复杂度增长，可能需要重新引入。但 chrome.storage 作为 single source of truth 的模式本身就足够，届时也可以加回。
- **ChatGPT Probe 端点不确定** → `backend-api/accounts/check` 可能变更。应用与 Claude Probe 同样的防御性解析策略。

## Open Questions

1. **ChatGPT 的 `credentials: 'include'` 是否同样有效？** — 需要对 chatgpt.com 做与 claude.ai 相同的 PoC 验证
2. **WXT 是否支持 React 19？** — 需要确认 WXT + React 19 + Tailwind 4 的组合是否有已知问题
3. **claude.ai API 实际响应格式** — 需要用 PoC 调一次 `/api/organizations/{orgId}/usage` 记录真实响应结构
