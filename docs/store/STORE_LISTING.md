# Chrome Web Store Listing

> Reference file for Chrome Web Store submission. Check and update before each review.

---

## 1. 商品详情 (Product Details)

### 产品详情

**标题** _(synced from wxt.config.ts → manifest.json)_

```
AI Pulse Tab
```

**摘要** _(synced from wxt.config.ts → manifest.json)_

```
AI usage dashboard in your new tab
```

### 说明

```
AI Pulse Tab replaces your new tab page with a clean dashboard that shows your AI usage quota at a glance.

  FEATURES

  ► Real-time usage quota display for Claude (Session, Weekly, Sonnet-only) and ChatGPT
  ► Color-coded progress bars — green when fresh, yellow at 50%, red at 80%
  ► Reset countdown timer so you always know when your limits refresh
  ► Customizable bookmarks grid — add, edit, or remove quick links to your favorite sites
  ► Daily todo list with priority levels and inline editing — auto-clears at midnight
  ► Dark / Light / System theme toggle with OS preference detection
  ► Auto-refreshes usage data every 5 minutes in the background

  HOW IT WORKS

  The extension reads your claude.ai and chatgpt.com session cookies locally to fetch usage data from each provider's API. All data is cached in your browser's local storage. Nothing is ever sent to any external server.

  PRIVACY FIRST

  • Zero data collection — no analytics, no tracking, no telemetry
  • Cookies are read locally and never transmitted to third parties
  • Usage data is cached on your device and never leaves your browser
  • Fully open source: https://github.com/SimonGino/ai-pulse-tab

  REQUIREMENTS

  • A Claude AI account (claude.ai) and/or ChatGPT account (chatgpt.com)
  • You must be logged in to the respective service for the extension to display your usage
```

### 分类与语言

- **类别:** 工具 (Tools)
- **语言:** 英语（美国） (English US)

---

## 2. 图片资源 (Image Assets)

### 商店图标

- **规格:** 128x128 像素
- **文件:** `public/icon/store-128.png`

### 屏幕截图

- **规格:** 1280x800 或 640x400，JPEG 或 24 位 PNG，不超过 5 张
- **文件:**
  1. `docs/store/screenshot-1-full.png` _(已更新 v0.1.2)_
  2. `docs/store/screenshot-2-dark-mode.png` _(已更新 v0.1.2)_

### 小型宣传图块

- **规格:** 440x280 画布，JPEG 或 24 位 PNG
- **文件:** `docs/store/promo-small-440x280.png` _(已更新 v0.1.2)_

### 顶部宣传图块

- **规格:** 1400x560 画布，JPEG 或 24 位 PNG
- **文件:** `docs/store/promo-marquee-1400x560.png` _(已更新 v0.1.2)_

### 宣传视频

- **YouTube URL:** _(空)_

---

## 3. 其他字段 (Other Fields)

- **官方网址:** 无
- **首页网址:** `https://github.com/SimonGino/ai-pulse-tab`
- **支持信息页面网址:** `https://github.com/SimonGino/ai-pulse-tab`

---

## 4. 隐私权 (Privacy)

### 单一用途说明

```
在新标签页中显示用户的 AI 服务（Claude、ChatGPT）用量配额信息，帮助用户实时了解使用额度和重置时间。
```

### 权限理由

#### storage

```
使用 chrome.storage.local 在本地缓存用户的用量数据和自定义书签，避免每次打开新标签页时重复发起网络请求。所有数据仅存储在本地，不会上传到任何外部服务器。
```

#### alarms

```
使用 chrome.alarms 每 5 分钟在后台刷新用户的 AI 用量数据，确保新标签页打开时显示的配额信息是最新的。
```

#### 主机权限 (host_permissions)

```
需要访问 https://claude.ai 和 https://chatgpt.com 的 API 接口，以获取用户当前的会话配额、周配额、模型用量等数据。此外，扩展通过标准 HTML 标签加载 Google Fonts 字体和 Google Favicon 服务获取书签图标，这些请求不涉及用户数据。
```

### 远程代码

- **是否使用远程代码:** 否
