## Context

项目当前状态：
- 详细技术方案文档已完成（`ai-usage-newtab-tech-plan.md`）
- PoC 已验证 `credentials: 'include'` + `host_permissions` 方案可行（`poc-mv3-cookie/`）
- 已有 5 个 spec（cookie-auth、claude-probe、build-toolchain、chatgpt-probe、testing）
- 无产品代码，需要从零搭建

本次 change 的范围是 Phase 1 MVP：仅 Claude 单 Provider，目标是打通"后台获取数据 → 缓存 → New Tab 渲染"的最小闭环。

## Goals / Non-Goals

**Goals:**
- 用 WXT 初始化项目脚手架，跑通 `wxt dev` 和 `wxt build`
- 实现 ClaudeProbe 完整数据链路（organizations → usage → overage）
- Background Service Worker 通过 chrome.alarms 定时刷新
- New Tab 页面渲染 Claude 用量卡片（进度条 + 倒计时 + 认证状态）
- 本地开发模式下可加载插件并看到真实数据

**Non-Goals:**
- 不实现 ChatGPT / Gemini 等其他 Provider
- 不做主题切换、7 日趋势图、设置面板等增强功能
- 不做 Chrome Web Store 上架准备
- 不做 Provider Registry 插件化机制（仅硬编码 Claude 一个 Probe）
- 不做 Options 页面

## Decisions

### D1：脚手架直接用 WXT React 模板

使用 `npx wxt@latest init --template react` 初始化，然后手动添加 Tailwind CSS 4。

**替代方案**：手动从零搭建 → 工作量大且容易遗漏 WXT 约定，不如利用官方模板。

### D2：MVP 阶段不引入 Provider Registry

技术方案中设计了 `UsageProbe` 接口 + Provider Registry 注册机制，但 MVP 只有 Claude 一个 Provider。直接在 background.ts 中硬编码调用 ClaudeProbe，不做抽象。

**理由**：YAGNI。等 Phase 2 加 ChatGPT 时再引入 Registry，届时有两个实际 Provider 来指导接口设计，比现在凭空抽象更准确。

### D3：数据流采用单向写读模式

```
Background (写) → chrome.storage.local → New Tab (读)
```

Background 是唯一的数据写入方，New Tab 只通过 `chrome.storage.local.get()` + `onChanged` 监听读取。不使用 `chrome.runtime.sendMessage` 做双向通信（除了 New Tab 触发手动刷新的 `REFRESH_NOW` 消息）。

**理由**：简化数据流，避免消息丢失（Service Worker 可能被回收）。storage 天然持久化，New Tab 每次打开都能拿到最新缓存。

### D4：Tailwind CSS 4 使用 @import 方式集成

Tailwind CSS 4 不再需要 PostCSS 插件，直接通过 `@import "tailwindcss"` 在 CSS 中引入，配合 Vite 的 CSS 处理即可。

### D5：MVP 阶段简化 UI

- 单个 Claude 卡片，不做多 Provider 网格布局
- 支持多 org 显示（PoC 验证 API 会返回多个 org）
- 进度条用纯 CSS div + width%，不引入图表库
- 颜色编码：绿(<50%) / 橙(50-80%) / 红(>80%)
- 倒计时用简单的 setInterval 每秒更新

### D6：使用 zod 做 API 响应校验

Claude API 是非官方 API，响应格式可能随时变更。用 zod 定义 schema，解析失败时 graceful degrade 而非崩溃。

## Risks / Trade-offs

- **WXT + React 19 + Tailwind CSS 4 组合兼容性** → 脚手架搭建后立即验证三者协同工作，有问题及时降级（如 React 18 或 Tailwind 3）
- **Claude API 响应格式与技术方案中的假设不符** → PoC 已采集过真实响应，但需要重新验证当前响应格式并据此实现 parser
- **Service Worker 被回收导致 alarm 延迟** → chrome.alarms 是 MV3 标准机制，Chrome 保证 alarm 会唤醒 SW，实际延迟可接受（秒级）
- **MVP 硬编码 Claude 导致后续重构** → 代价可控，ClaudeProbe 本身是独立模块，后续加 Registry 只需添加注册层，不需重写 Probe
