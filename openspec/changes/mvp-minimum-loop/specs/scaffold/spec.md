## ADDED Requirements

### Requirement: 项目 SHALL 使用 WXT React 模板初始化
项目 SHALL 通过 `npx wxt@latest init --template react` 创建，生成标准 WXT 目录结构。

#### Scenario: 项目初始化成功
- **WHEN** 开发者执行 `npx wxt@latest init --template react`
- **THEN** SHALL 生成 `src/entrypoints/`、`wxt.config.ts`、`package.json` 等标准文件
- **AND** `wxt dev` SHALL 能成功启动开发服务器

### Requirement: wxt.config.ts SHALL 声明 MV3 所需权限
`wxt.config.ts` 中 SHALL 配置 `permissions: ['cookies', 'storage', 'alarms']` 和 `host_permissions: ['https://claude.ai/*']`。

#### Scenario: 构建产物包含正确权限
- **WHEN** 执行 `wxt build`
- **THEN** 生成的 `manifest.json` SHALL 包含 `permissions` 数组含 `cookies`、`storage`、`alarms`
- **AND** SHALL 包含 `host_permissions` 数组含 `https://claude.ai/*`

### Requirement: 项目 SHALL 集成 Tailwind CSS 4
样式系统 SHALL 使用 Tailwind CSS 4，通过 `@import "tailwindcss"` 方式在 CSS 入口文件中引入。

#### Scenario: Tailwind 类名在 New Tab 页面生效
- **WHEN** New Tab 页面使用 Tailwind 类名（如 `bg-gray-900`、`text-white`）
- **THEN** 对应的 CSS 样式 SHALL 正确应用到 DOM 元素

### Requirement: 项目 SHALL 配置 TypeScript 严格模式
`tsconfig.json` SHALL 启用 `strict: true`，确保类型安全。

#### Scenario: 类型错误阻止构建
- **WHEN** 代码中存在 TypeScript 类型错误
- **THEN** `wxt build` SHALL 报告类型错误

### Requirement: 项目 SHALL 包含 core/types.ts 类型定义
`src/core/types.ts` SHALL 定义 `UsageProbe`、`UsageData`、`AuthStatus`、`QuotaWindow`、`ModelUsage` 等核心接口，与技术方案 §4.4 一致。

#### Scenario: ClaudeProbe 实现 UsageProbe 接口
- **WHEN** ClaudeProbe 类声明 `implements UsageProbe`
- **THEN** TypeScript 编译 SHALL 通过，确认接口契约满足
