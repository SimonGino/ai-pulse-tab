## Why

项目目前只有技术方案文档和一个 PoC（验证了 `credentials: 'include'` 方案可行），但还没有可运行的产品代码。需要尽快完成**最小可用闭环**：从 `wxt dev` 启动 → 打开新标签页 → 看到 Claude 真实用量数据。这是验证整个产品假设的第一步。

## What Changes

- **项目脚手架搭建**：基于 WXT + React 19 + TypeScript + Tailwind CSS 4 初始化项目，配置所有必要的 MV3 权限和 host_permissions
- **核心类型定义**：实现 `UsageProbe`、`UsageData`、`AuthStatus` 等 Domain 层接口
- **ClaudeProbe 实现**：通过 `credentials: 'include'` 调用 Claude API，获取 organizations + usage + overage 数据并归一化
- **Background 调度器**：使用 `chrome.alarms` 定时触发 ClaudeProbe，将结果写入 `chrome.storage.local`
- **New Tab 页面**：React 页面从 storage 读取缓存数据，展示 Claude 用量卡片（进度条 + 重置倒计时 + 认证状态）
- **基础测试**：ClaudeProbe 单元测试 + QuotaBar 组件测试

## Capabilities

### New Capabilities
- `scaffold`: WXT 项目脚手架初始化，包含所有入口文件、权限配置、依赖安装
- `claude-usage-display`: New Tab 页面展示 Claude 用量的完整数据流（Background 获取 → Storage 缓存 → UI 渲染）

### Modified Capabilities
（无修改，均为新建）

## Impact

- **新增代码目录**：`src/entrypoints/`、`src/core/`、`src/probes/`、`src/components/`、`src/hooks/`、`tests/`
- **新增配置文件**：`package.json`、`wxt.config.ts`、`tsconfig.json`、`tailwind.config.ts`、`vitest.config.ts`
- **依赖**：wxt、react 19、tailwindcss 4、vitest、zod
- **权限**：`cookies`、`storage`、`alarms` permissions + `https://claude.ai/*` host_permission
