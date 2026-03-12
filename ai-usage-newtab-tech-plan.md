# AI Usage New Tab — 技术实现方案

> Chrome 浏览器新标签页插件，一站式展示 Claude / ChatGPT 等 AI 服务的用量配额
>
> 文档版本：v1.0 | 2026-03-12

---

## 1. 项目概述

### 1.1 解决什么问题

AI 重度用户（开发者、PM、内容创作者）每天在 Claude、ChatGPT 等多个平台间切换，但**用量配额信息分散在各平台设置页深处**，无法一目了然地感知"我还剩多少额度""什么时候重置"。现有方案（CodexBar、ClaudeBar）均为 macOS 原生菜单栏应用，不覆盖 Windows/Linux 用户，且与浏览器工作流割裂。

### 1.2 产品定位

**每次打开新标签页，3 秒内看清所有 AI 服务的用量状态。**

- 形态：Chrome Extension (Manifest V3)，覆盖 New Tab 页
- 核心价值：**零配置感知用量** — 复用浏览器已有登录态，无需手动输入 API Key
- 目标用户：Claude Pro/Max、ChatGPT Plus/Team 的订阅用户

### 1.3 仓库命名建议

| 候选名称 | 风格 | 适合场景 |
|---|---|---|
| `ai-pulse-tab` | 品牌感 + 功能描述 | 偏产品化运营 |
| `tokenmeter` | 极简品牌 | 后续做独立产品 |
| `quota-dash` | 功能直白 | 开源社区友好 |
| `ai-usage-newtab` | 描述性 | SEO 友好、一看就懂 |

---

## 2. 竞品参考分析

### 2.1 CodexBar（steipete/CodexBar）⭐1.5k

| 维度 | 详情 |
|---|---|
| 形态 | macOS 菜单栏应用（Swift / SwiftUI） |
| 支持 Provider | 20+（Claude、Codex、Cursor、Gemini、Copilot、z.ai、Kimi、Kiro、Amp 等） |
| 数据获取策略 | **多源降级 Fallback Chain**：OAuth API → CLI PTY → Web Cookie |
| Claude 数据链路 | 读取浏览器 `sessionKey` cookie 或 Claude Code OAuth token（`sk-ant-oat...`），调用 `claude.ai/api/organizations/{orgId}/usage` |
| 关键 API 端点 | `GET /api/organizations` → org UUID<br>`GET /api/organizations/{orgId}/usage` → session/weekly 用量<br>`GET /api/organizations/{orgId}/overage_spend_limit` → Extra Usage 额度 |
| Cookie 管理 | 从 Safari/Chrome/Firefox cookie 数据库解密导入，缓存到 macOS Keychain |
| 架构亮点 | ProviderFetchStrategy 模式、ProviderDescriptorRegistry 统一注册、StatusItem 双进度条 UI |

### 2.2 ClaudeBar（tddworks/ClaudeBar）⭐600+

| 维度 | 详情 |
|---|---|
| 形态 | macOS 菜单栏应用（Swift / SwiftUI + Tuist） |
| 支持 Provider | 10+（Claude、Codex、Gemini、Copilot、Antigravity、z.ai、Kimi、Kiro、Amp） |
| 架构 | 三层分离：App（SwiftUI Views）→ Domain（QuotaMonitor 单一数据源）→ Infrastructure（Probes/Adapters） |
| Claude 数据获取 | CLI Probe（`claude` 命令行 `/usage`）+ API Probe（OAuth HTTP 直调） |
| 设计原则 | QuotaMonitor 作为 Single Source of Truth、Protocol-Based DI、Chicago School TDD |
| 扩展方式 | 通过 Claude Code Skill 引导添加新 provider（Parsing Tests → Probe Tests → Implementation → Registration） |

### 2.3 两者共同点与我们的差异化

**共同模式：**
- 都采用 Probe 概念（探针）去采集各 provider 的用量数据
- 都支持多种认证源的 fallback（OAuth → Cookie → CLI）
- 都定义了统一的 Provider 协议/接口来归一化不同厂商的数据格式

**我们的差异化：**
- **浏览器原生**：Chrome Extension 形态，天然可读取浏览器 cookie，不需要 Full Disk Access 等系统权限
- **跨平台**：Windows/Linux/macOS 通吃，只要用 Chrome 就能用
- **New Tab 沉浸式**：不是小弹窗/菜单栏，而是全屏 dashboard

---

## 3. 技术架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    New Tab Page (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Claude   │  │ ChatGPT  │  │ Gemini   │  │  Settings  │  │
│  │ Card     │  │ Card     │  │ Card     │  │  Panel     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────────┘  │
│       │              │              │                         │
│       └──────────────┼──────────────┘                        │
│                      │  chrome.storage.local (read cache)    │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────┐
│          Background Service Worker (MV3)                     │
│                      │                                       │
│  ┌───────────────────┴────────────────────┐                  │
│  │         Provider Manager               │                  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │                  │
│  │  │ Claude  │ │ ChatGPT │ │ Gemini  │  │                  │
│  │  │ Probe   │ │ Probe   │ │ Probe   │  │                  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘  │                  │
│  └───────┼───────────┼───────────┼────────┘                  │
│          │           │           │                            │
│  ┌───────┴───────────┴───────────┴────────┐                  │
│  │   fetch + credentials: 'include'      │                  │
│  │  (浏览器自动附带目标域名的 cookie)       │                  │
│  └───────────────────┬────────────────────┘                  │
│                      │                                       │
│  ┌───────────────────┴────────────────────┐                  │
│  │    chrome.alarms (定时触发刷新)          │                  │
│  │    chrome.storage.local (写入缓存)      │                  │
│  └────────────────────────────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  claude.ai / chatgpt.com │
         │  (非官方内部 API)          │
         └─────────────────────────┘
```

### 3.2 核心分层

借鉴 ClaudeBar 的三层架构思想，映射到 Chrome Extension 语境：

| 层 | 对应位置 | 职责 |
|---|---|---|
| **UI Layer** | `newtab/` (React Components) | 纯展示层，从 chrome.storage 读取缓存数据渲染 dashboard，不直接发网络请求 |
| **Domain Layer** | `core/` (TypeScript Modules) | 统一的 Provider 接口、UsageData 模型定义、状态归一化逻辑 |
| **Infrastructure Layer** | `probes/` (各 Provider 实现) | 各厂商的 cookie 获取 + API 调用 + 响应解析，类比 CodexBar/ClaudeBar 的 Probe 概念 |
| **Orchestration** | `background/` (Service Worker) | 定时调度、Probe 编排、缓存写入、错误聚合 |

### 3.3 关键设计决策

**D1：Cookie 复用（`credentials: 'include'`），而非 API Key**

通过 `host_permissions` + `credentials: 'include'`，Service Worker 中的 `fetch` 请求会自动携带目标域名的 cookie（PoC 已验证）。这等同于 CodexBar 读取 macOS Keychain 中缓存的浏览器 cookie，但**不需要 Full Disk Access 等操作系统级权限**，也不需要用户手动粘贴任何 token，甚至不需要显式调用 `chrome.cookies` API 读取 cookie 值。

**D2：Background 预取 + 缓存，New Tab 秒开**

New Tab 页面对加载速度极其敏感（用户期望 < 200ms 可交互）。因此所有 API 调用都在 Background Service Worker 里通过 `chrome.alarms` 定时执行，New Tab 页面只做 `chrome.storage.local.get()` 读取缓存数据，不阻塞渲染。

**D3：Provider 插件化**

参考 ClaudeBar 的 skill 引导模式和 CodexBar 的 ProviderDescriptorRegistry，设计统一的 `UsageProbe` 接口。新增一个 provider 只需要实现这个接口并注册，不改动框架代码。

---

## 4. Provider 数据获取方案

### 4.1 Claude（核心 Provider）

**认证方式：** `credentials: 'include'` + `host_permissions`（浏览器自动附带 `claude.ai` 的 session cookie）

**数据链路：**

```
fetch('https://claude.ai/api/organizations', { credentials: 'include' })
  → 浏览器自动附带 claude.ai 所有 cookie（含 sessionKey）
  Response: [{ uuid: "org-xxx", name: "Personal" }, { uuid: "org-yyy", name: "Team" }]
       │
       ▼  （对每个 org 分别获取）
fetch(`https://claude.ai/api/organizations/${orgId}/usage`, { credentials: 'include' })
  Response: {
    session_usage: 0.35,        // 5h session 已用 35%
    weekly_usage: 0.12,         // weekly 已用 12%
    model_usage: { opus: 0.5 }, // 模型级用量
    session_reset_at: "2026-03-12T18:00:00Z",
    weekly_reset_at: "2026-03-16T00:00:00Z"
  }
       │
       ▼ (可选)
fetch(`https://claude.ai/api/organizations/${orgId}/overage_spend_limit`, { credentials: 'include' })
  Response: { spend: 5.20, limit: 100.00 }
```

**降级策略：**

```
credentials: 'include' 方式（自动，首选）
    ↓ 返回 401/403
提示用户粘贴 OAuth token（sk-ant-oat01-...）
    ↓ 失败
显示"请登录 claude.ai 后刷新"
```

### 4.2 ChatGPT / OpenAI

**认证方式：** `credentials: 'include'` + `host_permissions: ["https://chatgpt.com/*"]`

> **⚠️ 前置条件：** ChatGPT 端点需要先用 PoC 验证 `credentials: 'include'` 的可行性（见任务 3.2）。以下设计基于社区研究，实际响应格式待 PoC 确认后更新。

**主要端点：**

| 端点 | 用途 | 备注 |
|---|---|---|
| `GET /backend-api/accounts/check/v4-2023-04-27` | 获取账户信息、plan 类型、entitlements | 主要端点，包含 rate limit 信息 |
| `GET /backend-api/me` | 获取用户基本信息 | 降级方案 |

**数据链路：**

```
fetch('https://chatgpt.com/backend-api/accounts/check/v4-2023-04-27', {
  credentials: 'include'
})
  Response (预期格式，待 PoC 验证):
  {
    "accounts": {
      "default": {
        "account": { "plan_type": "plus", ... },
        "entitlement": {
          "rate_limit": {
            "messages_used": 30,
            "messages_cap": 80,
            "reset_at": "2026-03-12T18:00:00Z"
          }
        }
      }
    }
  }
       │
       ▼
  ChatGPTProbe 将 messages_used / messages_cap 转换为 0-1 百分比
  填充 QuotaWindow { used: 0.375, resetAt: ... }
```

**降级策略：**

```
credentials: 'include' + accounts/check（首选）
    ↓ 返回 404（端点路径变更）
尝试 /backend-api/me 获取 plan 信息（部分数据）
    ↓ 返回 401/403（可能有 CF challenge 等额外认证）
显示"请登录 chatgpt.com 后刷新"
```

**ChatGPT 特殊考虑：**
- ChatGPT 可能不暴露百分比用量，而是消息数 + 上限。Probe 用 `messages_used / messages_cap` 计算百分比
- `backend-api` 端点可能需要额外 header（如 Cloudflare challenge token），需 PoC 验证
- 端点路径包含版本号（`v4-2023-04-27`），可能会更新。Probe 应支持尝试已知的多个版本路径

### 4.3 Gemini（预留）

**认证方式：** 复用 `gemini.google.com` 的 Google session cookie 或本地 Gemini CLI 的 OAuth credential

### 4.4 统一 Provider 接口

```typescript
// core/types.ts

interface UsageProbe {
  /** Provider 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 品牌色 */
  color: string
  /** 检查认证状态 */
  checkAuth(): Promise<AuthStatus>
  /** 获取用量数据 */
  fetchUsage(): Promise<UsageData | null>
}

type AuthStatus =
  | { status: 'authenticated'; account: string }
  | { status: 'expired'; message: string }
  | { status: 'not_logged_in' }

interface UsageData {
  provider: string
  fetchedAt: number  // timestamp

  session?: QuotaWindow   // 5h 滑动窗口
  weekly?: QuotaWindow    // 每周配额
  daily?: QuotaWindow     // 每日（部分 provider）

  models?: ModelUsage[]   // 按模型拆分
  extra?: {               // Extra Usage / Credits
    spent: number
    limit: number
    currency: string
  }
  plan?: string           // Pro / Max / Plus / Team
}

interface QuotaWindow {
  used: number            // 0-1 百分比
  resetAt: Date           // 重置时间
  label?: string          // "Session (5h)" / "Weekly"
}

interface ModelUsage {
  model: string           // "opus" / "sonnet" / "gpt-4o"
  used: number            // 0-1 百分比
}
```

---

## 5. 技术栈选型

| 层面 | 选型 | 理由 |
|---|---|---|
| **Extension 框架** | WXT (wxt.dev) | 活跃维护、原生 MV3 支持、Vite 6 兼容、内置 HMR + storage/messaging 工具函数、跨浏览器支持（CRXJS 维护停滞、Vite 6 兼容性差，已弃用） |
| **UI 框架** | React 19 + TypeScript | 生态丰富，组件复用性好 |
| **样式** | Tailwind CSS 4 | 快速构建 dashboard UI，主题切换方便 |
| **图表** | CSS 进度条 + `<canvas>` 手绘 / uPlot (~10KB) | 进度条用纯 CSS（div + width%），7 日趋势图用 canvas 或 uPlot。Recharts ~150KB gz 对 New Tab <200ms 可交互的目标过重，Phase 1 不引入 |
| **构建** | Vite 6 | 快速构建，WXT 底层依赖 |
| **状态管理** | `useUsageData` hook + `chrome.storage.local` | 数据流单一路径（background 写 → newtab 读），WXT storage 自带响应式，不需要额外 store 层。如未来 UI 复杂度增长可再引入 |
| **定时调度** | chrome.alarms API | MV3 标准方式，替代 setInterval |
| **数据缓存** | chrome.storage.local | 插件本地缓存，容量 > 5MB |
| **Cookie 读取** | chrome.cookies API | 读取目标网站的 session cookie |

### 5.1 Manifest V3 权限清单

```json
{
  "manifest_version": 3,
  "name": "AI Usage New Tab",
  "permissions": [
    "cookies",
    "storage",
    "alarms",
    "offscreen"
  ],
  "host_permissions": [
    "https://claude.ai/*",
    "https://chatgpt.com/*",
    "https://api.anthropic.com/*"
  ],
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  }
}
```

**权限说明：**
- `cookies`：（可选）用于 `checkAuth()` 中检测 cookie 存在性，判断用户是否已登录。主路径的 API 调用不需要此权限（`credentials: 'include'` 足够）
- `storage`：缓存用量数据
- `alarms`：定时后台刷新（MV3 不能用 setInterval）
- `offscreen`：（可选）ChatGPT dashboard 页面 scrape 降级方案
- `host_permissions`：允许向这些域名发起 fetch 请求，并使 `credentials: 'include'` 能自动附带 cookie

---

## 6. 项目结构

采用 WXT file-based entrypoints 布局。WXT 通过 `src/entrypoints/` 目录自动发现入口文件，无需手动配置 manifest 中的 entrypoints。

```
ai-pulse-tab/
├── src/
│   ├── entrypoints/                  # WXT file-based entrypoints（自动发现）
│   │   ├── background.ts            # Service Worker 入口（调度 + Probe 编排 + 缓存写入）
│   │   ├── newtab/                   # New Tab 页面
│   │   │   ├── index.html
│   │   │   ├── main.tsx              # React 挂载点
│   │   │   ├── App.tsx               # New Tab 根组件
│   │   │   └── App.css
│   │   └── options/                  # 选项页（高级设置）
│   │       ├── index.html
│   │       ├── main.tsx
│   │       └── Options.tsx
│   │
│   ├── components/                   # 共享 UI 组件
│   │   ├── ProviderCard.tsx          # 单个 Provider 卡片（含 org sub-card）
│   │   ├── QuotaBar.tsx             # CSS 进度条组件（参考 CodexBar 双 bar）
│   │   ├── ResetCountdown.tsx       # 重置倒计时
│   │   ├── TrendChart.tsx           # 7日趋势（canvas 或 uPlot）
│   │   ├── Clock.tsx                # 时钟 + 问候语
│   │   └── SettingsDrawer.tsx       # 设置抽屉
│   │
│   ├── hooks/
│   │   ├── useUsageData.ts          # 从 chrome.storage 读取数据
│   │   └── useTheme.ts              # 主题管理
│   │
│   ├── core/                         # Domain 层（接口 + 模型 + 工具函数）
│   │   ├── types.ts                  # UsageProbe / UsageData 等接口定义
│   │   ├── constants.ts              # 刷新间隔、颜色、阈值
│   │   └── utils.ts                  # 时间格式化、百分比计算
│   │
│   ├── probes/                       # Infrastructure 层（各 Provider 实现）
│   │   ├── claude-probe.ts           # Claude credentials:include → API
│   │   ├── chatgpt-probe.ts          # ChatGPT credentials:include → API
│   │   ├── gemini-probe.ts           # Gemini（预留）
│   │   └── index.ts                  # Provider 注册表（Registry）
│   │
│   └── utils/                        # 通用工具
│       └── storage.ts                # WXT storage 工具封装 + schema 迁移
│
├── tests/                            # 测试目录
│   └── fixtures/                     # 真实 API 响应 JSON samples
│
├── public/
│   ├── icons/                        # 插件图标
│   └── _locales/                     # i18n 预留（chrome.i18n）
│       └── en/
│           └── messages.json
│
├── docs/
│   └── claude-api-response-samples/  # PoC 验证的真实 API 响应
│
├── wxt.config.ts                     # WXT 配置（替代 vite.config.ts + manifest.json）
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

> **注意：** WXT 自动从 `src/entrypoints/` 生成 `manifest.json`，无需手动维护。manifest 中的 permissions 和 host_permissions 通过 `wxt.config.ts` 配置。

---

## 7. 核心流程设计

### 7.1 后台数据刷新流程

```
┌─────────────────────────────────────────────────┐
│           chrome.alarms("refresh-usage")         │
│                 每 5 分钟触发                      │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │  ProviderManager       │
          │  .refreshAll()         │
          └────────────┬───────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Claude   │ │ ChatGPT  │ │ Gemini   │
   │ Probe    │ │ Probe    │ │ Probe    │
   └────┬─────┘ └────┬─────┘ └────┬─────┘
        │             │             │
        ▼             ▼             ▼
   checkAuth()   checkAuth()   checkAuth()
        │             │             │
        ▼             ▼             ▼
   fetchUsage()  fetchUsage()  fetchUsage()
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 数据归一化 & 错误处理   │
          │ → UsageData[]         │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ chrome.storage.local  │
          │ .set({ usageData })   │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ 触发 storage onChange  │
          │ → New Tab 自动刷新 UI  │
          └───────────────────────┘
```

### 7.2 Claude Probe 详细流程

```typescript
// probes/claude-probe.ts（伪代码示意）

class ClaudeProbe implements UsageProbe {
  id = 'claude'
  name = 'Claude'
  color = '#D97706'

  async checkAuth(): Promise<AuthStatus> {
    // 直接尝试请求，由 credentials: 'include' 自动附带 cookie
    try {
      const orgs = await this.fetchOrganizations()
      if (!orgs.length) return { status: 'expired', message: '请重新登录 claude.ai' }
      return {
        status: 'authenticated',
        account: orgs[0]?.name || 'Personal'
      }
    } catch {
      return { status: 'not_logged_in' }
    }
  }

  async fetchUsage(): Promise<UsageData | null> {
    const orgs = await this.fetchOrganizations()
    if (!orgs.length) return null

    // 为每个 org 获取用量（支持多组织）
    const allUsage = await Promise.all(
      orgs.map(async (org) => {
        const [usage, overage] = await Promise.allSettled([
          this.fetchUsageAPI(org.uuid),
          this.fetchOverageAPI(org.uuid)
        ])
        return this.normalizeResponse(org, usage, overage)
      })
    )

    return allUsage
  }

  private async fetchOrganizations() {
    const res = await fetch('https://claude.ai/api/organizations', {
      credentials: 'include'  // 浏览器自动附带 claude.ai 的 cookie
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  private async fetchUsageAPI(orgId: string) {
    return fetch(
      `https://claude.ai/api/organizations/${orgId}/usage`,
      { credentials: 'include' }
    ).then(r => r.json())
  }

  private async fetchOverageAPI(orgId: string) {
    return fetch(
      `https://claude.ai/api/organizations/${orgId}/overage_spend_limit`,
      { credentials: 'include' }
    ).then(r => r.json())
  }
}
```

### 7.3 New Tab 数据消费流程

```typescript
// newtab/hooks/useUsageData.ts

function useUsageData() {
  const [data, setData] = useState<UsageData[]>([])
  const [lastUpdated, setLastUpdated] = useState<number>(0)

  useEffect(() => {
    // 1. 初始加载缓存
    chrome.storage.local.get(['usageData', 'lastUpdated'], (result) => {
      if (result.usageData) setData(result.usageData)
      if (result.lastUpdated) setLastUpdated(result.lastUpdated)
    })

    // 2. 监听后台刷新
    const listener = (changes: StorageChanges) => {
      if (changes.usageData) setData(changes.usageData.newValue)
      if (changes.lastUpdated) setLastUpdated(changes.lastUpdated.newValue)
    }
    chrome.storage.local.onChanged.addListener(listener)

    return () => chrome.storage.local.onChanged.removeListener(listener)
  }, [])

  // 3. 手动刷新（发消息给 background）
  const refresh = () => {
    chrome.runtime.sendMessage({ type: 'REFRESH_NOW' })
  }

  return { data, lastUpdated, refresh }
}
```

---

## 8. UI 设计要点

### 8.1 New Tab 信息架构

```
┌────────────────────────────────────────────────────────────────┐
│  ☀ Good morning          14:32  Thu, Mar 12                    │
│                                                                │
│  ┌──────────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Claude         │  │   ChatGPT   │  │   Gemini    │       │
│  │   ●  Pro         │  │   ●  Plus   │  │   ○  N/A    │       │
│  │                  │  │             │  │             │       │
│  │  ┌── Personal ─┐ │  │  GPT-4o     │  │  (未登录)    │       │
│  │  │ Session     │ │  │  ██████░ 80%│  │             │       │
│  │  │ ████░░ 65%  │ │  │  重置: 4h12m │  │  [去登录]    │       │
│  │  │ 重置: 2h31m  │ │  │             │  │             │       │
│  │  │ Weekly      │ │  │             │  │             │       │
│  │  │ ██░░░░ 23%  │ │  │             │  │             │       │
│  │  │ Extra: $5   │ │  │             │  │             │       │
│  │  │ /$100       │ │  │             │  │             │       │
│  │  └─────────────┘ │  │             │  │             │       │
│  │  ┌── Team ─────┐ │  │             │  │             │       │
│  │  │ Session     │ │  │             │  │             │       │
│  │  │ ██░░░░ 20%  │ │  │             │  │             │       │
│  │  │ 重置: 3h05m  │ │  │             │  │             │       │
│  │  │ Weekly      │ │  │             │  │             │       │
│  │  │ █░░░░░ 10%  │ │  │             │  │             │       │
│  │  └─────────────┘ │  │             │  │             │       │
│  └──────────────────┘  └─────────────┘  └─────────────┘       │
│                                                                │
│  ─── 7日趋势 ────────────────────────────────────               │
│  📈 [Claude ···  ChatGPT ───]                                  │
│                                                                │
│                              最后更新: 2分钟前  ⟳  ⚙           │
└────────────────────────────────────────────────────────────────┘
```

**多组织（Multi-Org）展示策略：**

PoC 已验证 Claude 可返回多个 org（如 Personal + Team），每个 org 配额独立。展示方案：

- **默认**：每个 org 作为 sub-card 嵌套在 Provider Card 内，显示 org 名称 + 独立进度条
- **单 org 用户**：不显示 sub-card 包裹，直接平铺展示（与原方案一致）
- **设置项**：用户可在 Options 页中选择隐藏特定 org（如只关心 Team org，隐藏 Personal）
- **数据模型**：`UsageData` 增加 `orgId` 和 `orgName` 字段，一个 provider 可返回多条 `UsageData`

### 8.2 进度条设计

参考 CodexBar 的**双进度条**设计：

- **上方粗条**：5h Session 配额（最常关心的）
- **下方细条**：Weekly 配额（背景参考）
- **颜色编码**：
  - 🟢 绿色 `<50%` — 充足
  - 🟡 橙色 `50-80%` — 注意
  - 🔴 红色 `>80%` — 警告
- **Pace Tick Mark**（参考 ClaudeBar v0.4.30）：进度条下方标注一个刻度线，表示"按当前时间窗口的理想消耗速率，你应该在这个位置"

### 8.3 主题支持

| 主题 | 描述 |
|---|---|
| System | 跟随系统 Light/Dark |
| Dark | 固定深色，适合开发者 |
| Minimal | 极简白底，干净 |
| Terminal | 终端风格（参考 ClaudeBar CLI 主题） |

---

## 9. 实现难点与应对

### 9.1 难点一：Cookie 跨域请求（难度：已缓解 ✅）

**问题：** Service Worker 中用 `fetch` 请求 `claude.ai/api/*` 时，浏览器不会自动带上 cookie（非同源）。

**方案：** 使用 `credentials: 'include'` + `host_permissions`。PoC 已验证：只要 `manifest.json` 中声明了对应域名的 `host_permissions`，在 Service Worker 中 `fetch` 时带上 `credentials: 'include'`，浏览器会自动附带目标域名的所有 cookie（包括 `sessionKey`）。

```typescript
// ✅ 正确方案：credentials: 'include'（PoC 已验证可行）
const response = await fetch('https://claude.ai/api/organizations', {
  credentials: 'include'
})

// ❌ 已废弃方案：手动设置 Cookie header
// MV3 Service Worker 会静默剥离 forbidden header（如 Cookie），导致 403
// const response = await fetch(url, {
//   headers: { 'Cookie': `sessionKey=${value}` },
//   credentials: 'omit'
// })
```

**PoC 验证结论：**
- 手动设置 `Cookie` header → MV3 静默剥离 forbidden header，API 返回 403
- `declarativeNetRequest` 动态注入 → 可行但过于复杂，有规则数量限制和竞态风险
- `credentials: 'include'` + `host_permissions` → **直接可用，浏览器自动附带 cookie**（推荐方案）
- Offscreen document 代理 → 作为最终降级方案保留，但不作为主路径

### 9.2 难点二：非官方 API 稳定性（难度：高）

**问题：** `claude.ai/api/organizations/{orgId}/usage` 不是 Anthropic 公开文档中的 API，随时可能变更格式或路径。ChatGPT 侧同理。

**应对：**
- 每个 Probe 的响应解析做**防御性编程**，所有字段用 optional chaining
- 定义 schema validation（用 zod），解析失败时记录原始响应到 storage 方便 debug
- 设计**降级 UI**：API 挂了不白屏，显示"数据暂不可用，最后更新于 XX 分钟前"
- 社区维护：API 变更后通过 Extension 自动更新机制快速推补丁

### 9.3 难点三：Cookie 过期与认证状态管理（难度：中）

**问题：** Session cookie 有有效期，过期后拿不到数据。用户需要重新登录目标网站。

**应对：**
- 每次 probe 时先 `checkAuth()`，检测 cookie 存在性和有效性
- UI 上清晰展示每个 provider 的认证状态（✅ 已连接 / ⚠️ 需重新登录 / ○ 未配置）
- 点击"需重新登录"直接跳转 `chrome.tabs.create({ url: 'https://claude.ai' })`

### 9.4 难点四：MV3 Service Worker 生命周期（难度：中）

**问题：** Manifest V3 的 Service Worker 不常驻，空闲 30 秒后会被回收。

**应对：**
- 使用 `chrome.alarms` 触发定时任务（最小间隔 1 分钟）
- 不依赖内存状态，所有数据持久化到 `chrome.storage.local`
- Service Worker 唤醒后从 storage 恢复上下文再执行 probe

### 9.5 难点五：Chrome Web Store 审核（难度：中）

**问题：** 需要 `cookies` 权限 + 多个 `host_permissions`，审核会更严格。

**应对：**
- 编写清晰的隐私政策文档，说明只读取 cookie 用于获取用量数据，不存储/传输任何敏感信息
- `host_permissions` 只声明实际需要的域名
- 提供详细的"为什么需要这些权限"的说明文案

---

## 10. 数据存储设计

```typescript
// chrome.storage.local 的数据结构

interface StorageSchema {
  // Schema 版本号（用于数据迁移）
  schemaVersion: number

  // 用量数据缓存
  usageData: UsageData[]

  // 最后更新时间
  lastUpdated: number

  // 历史趋势（最近 30 天，每天一条快照）
  usageHistory: {
    date: string       // "2026-03-12"
    providers: {
      [providerId: string]: {
        sessionPeak: number
        weeklyPeak: number
      }
    }
  }[]

  // 用户设置
  settings: {
    refreshInterval: 5 | 10 | 15 | 30  // 分钟
    enabledProviders: string[]
    theme: 'system' | 'dark' | 'minimal' | 'terminal'
    showClock: boolean
    showTrend: boolean
    budgetAlerts: {
      [providerId: string]: number  // 预警阈值 0-1
    }
  }

  // 各 Provider 的认证状态缓存
  authStatus: {
    [providerId: string]: AuthStatus & { checkedAt: number }
  }
}
```

### 10.1 Schema 版本迁移机制

插件更新可能导致 `StorageSchema` 结构变化。为避免数据丢失，采用版本号 + 迁移函数链的方式：

```typescript
// utils/storage.ts

const CURRENT_SCHEMA_VERSION = 1

// 迁移函数链：每个函数负责 N → N+1 的数据变换
const migrations: Record<number, (data: any) => any> = {
  // 0 → 1: 初始版本，添加 schemaVersion 字段
  0: (data) => ({ ...data, schemaVersion: 1 }),
  // 1 → 2: 示例 — 未来需要时在此添加
}

/**
 * Background Service Worker 启动时调用。
 * 检查当前 storage 中的 schemaVersion，按顺序执行所有需要的迁移。
 */
async function migrateStorage() {
  const stored = await chrome.storage.local.get(null)
  let { schemaVersion = 0 } = stored
  let data = { ...stored }

  while (schemaVersion < CURRENT_SCHEMA_VERSION) {
    const migrate = migrations[schemaVersion]
    if (migrate) {
      data = migrate(data)
    }
    schemaVersion++
  }

  data.schemaVersion = CURRENT_SCHEMA_VERSION
  await chrome.storage.local.set(data)
}
```

**触发时机：** 在 `background.ts` 的 `chrome.runtime.onInstalled` 事件中调用 `migrateStorage()`，确保每次插件安装或更新后执行迁移。

---

## 10.5 测试策略

### 测试框架

| 工具 | 用途 |
|---|---|
| Vitest | 单元测试 + 组件测试运行器（与 Vite/WXT 工具链一致） |
| @testing-library/react | React 组件测试 |
| happy-dom | 轻量 DOM 模拟（替代 jsdom） |

### Probe Mock 方案

Probe 测试**不依赖**真实 cookie 或 live API 调用。所有外部依赖通过 mock 注入：

```typescript
// tests/setup.ts — 全局 mock chrome API
const chromeMock = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      onChanged: { addListener: vi.fn(), removeListener: vi.fn() }
    }
  },
  alarms: { create: vi.fn(), onAlarm: { addListener: vi.fn() } },
  runtime: { sendMessage: vi.fn(), onMessage: { addListener: vi.fn() } }
}
globalThis.chrome = chromeMock as any
```

```typescript
// tests/probes/claude-probe.test.ts
import { describe, it, expect, vi } from 'vitest'
import { ClaudeProbe } from '../../src/probes/claude-probe'

describe('ClaudeProbe', () => {
  it('should parse organizations response', async () => {
    // Mock fetch 返回 fixtures 中的真实响应
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(fixtures.claudeOrgs))
    )
    const probe = new ClaudeProbe()
    const result = await probe.fetchUsage()
    expect(result).toMatchSnapshot()
  })

  it('should return null on API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 500 })
    )
    const probe = new ClaudeProbe()
    const result = await probe.fetchUsage()
    expect(result).toBeNull()
  })
})
```

### 组件测试

关键 UI 组件需有组件测试：

- **QuotaBar**：验证 width% 正确、颜色阈值（<50% 绿、50-80% 橙、>80% 红）
- **ProviderCard**：验证多 org sub-card 渲染、认证状态展示
- **ResetCountdown**：验证倒计时计算和格式化

### Fixtures 目录结构

```
tests/
├── fixtures/
│   ├── claude-orgs-response.json        # /api/organizations 真实响应
│   ├── claude-usage-response.json       # /api/organizations/{id}/usage 真实响应
│   ├── claude-overage-response.json     # /api/organizations/{id}/overage_spend_limit
│   └── chatgpt-accounts-check.json      # /backend-api/accounts/check 真实响应
├── setup.ts                              # Chrome API 全局 mock
└── probes/
    ├── claude-probe.test.ts
    └── chatgpt-probe.test.ts
```

### CI 配置

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
```

测试在 CI 中运行无需 Chrome 浏览器实例或真实 session cookie。所有外部依赖通过 mock 或 fixtures 提供。

---

## 10.6 CSP 兼容性

Manifest V3 对 Content Security Policy 有严格限制：

- **不允许** `unsafe-eval`、`unsafe-inline`
- **不允许** 远程代码执行（所有 JS 必须打包在扩展中）

**React 19 + Vite 生产构建兼容性确认：**
- React 19 生产模式不使用 `eval()` 或 `new Function()`，符合 MV3 CSP
- Vite 生产构建默认输出静态 JS bundle，不依赖 inline script
- Tailwind CSS 4 编译时生成静态 CSS，不需要运行时 style 注入
- **注意**：开发模式下 Vite HMR 可能使用 `eval()`，但 WXT 的 dev 模式已处理此问题，通过 host page + iframe 架构绕开 CSP 限制

> **WXT + React 19 + Tailwind CSS 4 组合验证（待 PoC 确认）：**
> 1. `npx wxt@latest init --template react` 创建最小项目
> 2. 升级到 React 19、添加 Tailwind CSS 4
> 3. 确认 `wxt dev` HMR 正常、`wxt build` 生产构建无 CSP 违规
> 4. 在 Chrome 中加载 `.output/chrome-mv3/`，确认 newtab 页面正常渲染

---

## 10.7 i18n 预留

从 Phase 1 开始预留 `chrome.i18n` 目录结构，避免后期改造字符串的大范围重构。

**目录结构：**

```
public/
└── _locales/
    ├── en/
    │   └── messages.json
    └── zh_CN/          # Phase 4 添加
        └── messages.json
```

**Phase 1 策略：**
- UI 字符串直接写在代码中（硬编码英文），不做 i18n 封装
- 但在项目结构中预留 `_locales/` 目录，`manifest.json` 中声明 `default_locale: "en"`
- Phase 4 实施 i18n 时，用脚本批量提取字符串到 `messages.json`，替换为 `chrome.i18n.getMessage()` 调用

```json
// public/_locales/en/messages.json（Phase 1 最小化）
{
  "appName": {
    "message": "AI Usage New Tab"
  },
  "appDescription": {
    "message": "See your AI service usage at a glance"
  }
}
```

---

## 11. 开发路线图

### Phase 1：MVP — Claude 单 Provider（2 周）

**目标：** 能在 New Tab 上看到 Claude 的 session/weekly 用量

- [ ] 项目脚手架（WXT + React 19 + Tailwind CSS 4 + TypeScript）
- [ ] 实现 ClaudeProbe：cookie 读取 → organizations API → usage API
- [ ] Background scheduler：chrome.alarms 定时刷新 + storage 缓存
- [ ] New Tab 页面：单卡片展示 Claude 用量（进度条 + 重置倒计时）
- [ ] 基础认证状态提示（已连接 / 需登录）
- [ ] 本地开发者模式可用

### Phase 2：多 Provider + UI 打磨（2 周）

**目标：** 支持 ChatGPT，dashboard 达到可用质量

- [ ] 实现 ChatGPTProbe（cookie → backend-api）
- [ ] Provider Registry 注册机制
- [ ] 多卡片布局 + 响应式
- [ ] 主题切换（System / Dark / Minimal）
- [ ] 时钟 + 问候语
- [ ] 设置面板（刷新间隔、启用/禁用 provider）
- [ ] 手动刷新按钮

### Phase 3：稳定性 + 上架（1 周）

**目标：** Chrome Web Store 上架

- [ ] 错误处理兜底（API 失败降级、网络离线状态）
- [ ] Cookie 过期检测 + 重新登录引导
- [ ] 隐私政策文档
- [ ] Chrome Web Store 资产（截图、描述、权限说明）
- [ ] 自动化 CI/CD（GitHub Actions → CRX 打包）

### Phase 4：增强功能（持续）

- [ ] 7 天趋势折线图
- [ ] 预算预警通知（chrome.notifications）
- [ ] Pace Tick Mark 理想消耗速率参考线
- [ ] Gemini / Cursor 等更多 provider
- [ ] 快捷链接入口（一键跳转 claude.ai / chatgpt.com）
- [ ] Firefox 适配（WebExtension 兼容）
- [ ] i18n 国际化（中/英）

---

## 12. 风险与缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|---|---|---|---|
| claude.ai 内部 API 变更/失效 | 核心功能不可用 | 高 | 防御性解析 + 快速推更新 + 社区反馈机制 |
| ~~Cookie header 在 MV3 中被限制~~ | ~~无法携带认证信息~~ | ~~已缓解 ✅~~ | PoC 已验证 `credentials: 'include'` + `host_permissions` 方案可行，浏览器自动附带 cookie。Offscreen document 保留为降级方案 |
| ChatGPT `backend-api` 端点可能需要额外认证 | ChatGPT Probe 不可用 | 中 | `backend-api` 端点可能受 Cloudflare challenge 保护或需要额外 header（如 `oai-device-id`）。PoC 验证后确定；降级方案为 offscreen document 加载 ChatGPT 页面 scrape |
| WXT 与 React 19 / Tailwind CSS 4 版本兼容性 | 构建失败或运行时异常 | 低 | Phase 1 启动前用 `wxt init` + 升级依赖验证组合可行性。WXT 社区活跃，已支持 React 18，React 19 兼容性待确认 |
| Chrome Web Store 审核拒绝 | 无法分发 | 中 | 完善隐私政策，最小化权限声明，提供侧载安装备选 |
| Anthropic / OpenAI 明确禁止第三方调用 | 法律与合规风险 | 低 | 监控 ToS 变化，保持纯只读行为，不缓存对话内容 |
| Service Worker 被回收导致定时任务不稳定 | 数据不及时 | 低 | 完全依赖 chrome.alarms，不依赖内存定时器 |

---

## 13. 参考资料

| 项目 | 链接 | 借鉴点 |
|---|---|---|
| CodexBar | https://github.com/steipete/CodexBar | 多源 Fallback 策略、Claude API 端点、Provider 注册机制 |
| ClaudeBar | https://github.com/tddworks/ClaudeBar | 三层架构、QuotaMonitor 单一数据源、TDD Provider 添加流程 |
| Claude-Usage-Extension | https://github.com/lugia19/Claude-Usage-Extension | Chrome Extension 最佳实践、Content Script token 计算 |
| claude-usage-extension | https://github.com/cfranci/claude-usage-extension | OAuth token 方式 + badge 颜色编码 |
| WXT | https://wxt.dev | Chrome Extension 框架，替代 CRXJS |
| Chrome Extension MV3 Docs | https://developer.chrome.com/docs/extensions/mv3/ | 权限模型、Service Worker 生命周期 |
