## Why

当前商店图标（store-128.png）的设计内容没有填满整个 128×128 画布，深色背景周围存在透明像素间隙，导致在 Chrome Web Store 等浅色背景上显示时出现明显的锯齿/伪影。需要重新生成一个干净、边缘填满的商店图标。

## What Changes

- 重新设计并生成 `public/icon/store-128.png`，确保图标内容完整填满 128×128 画布，无透明间隙
- 同步更新所有尺寸的图标（16/32/48/96/128），保持视觉一致性
- 优化图标的圆角与边缘处理，符合 Chrome Web Store 图片指南

## Capabilities

### New Capabilities

- `store-icon`: 商店图标的设计规范与生成流程，确保所有尺寸图标一致且无伪影

### Modified Capabilities

<!-- 无需修改现有能力 -->

## Impact

- 受影响文件：`public/icon/store-128.png`、`public/icon/128.png`、`public/icon/96.png`、`public/icon/48.png`、`public/icon/32.png`、`public/icon/16.png`
- 无代码逻辑变更，仅替换静态资源
- 需要重新构建扩展以更新 `.output/` 中的图标副本
