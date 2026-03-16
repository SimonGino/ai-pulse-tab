## ADDED Requirements

### Requirement: Favicon 图标获取
书签 SHALL 使用 Google Favicon 服务（`https://www.google.com/s2/favicons?domain={domain}&sz=32`）获取网站图标。系统 SHALL 从书签 URL 中提取域名作为请求参数。

#### Scenario: 正常获取 favicon
- **WHEN** 书签 URL 为 `https://claude.ai/chat`
- **THEN** 系统请求 `https://www.google.com/s2/favicons?domain=claude.ai&sz=32` 并显示返回的图标

#### Scenario: 纯域名提取
- **WHEN** 书签 URL 为 `https://www.github.com/user/repo`
- **THEN** 系统提取域名 `www.github.com` 用于 favicon 请求

### Requirement: Favicon 加载失败 Fallback
当 favicon 图片加载失败时，系统 SHALL 显示书签名称的第一个字符作为灰色首字母图标。

#### Scenario: Favicon 加载失败显示首字母
- **WHEN** favicon 图片触发 onerror 事件
- **THEN** 隐藏 img 元素，显示书签名称首字符，颜色为 `--pixel-gray`

#### Scenario: 已有书签的 letter 字段作为 fallback
- **WHEN** 旧版书签数据包含 `letter` 字段且 favicon 加载失败
- **THEN** 使用已有的 `letter` 字段而非从 name 提取

### Requirement: 书签紧凑行布局
书签 SHALL 以紧凑的水平排列展示：每个书签包含 favicon 图标（或 fallback 首字母）+ 灰色文字标签。整体风格 SHALL 为灰色调，不使用彩色。

#### Scenario: 书签行渲染
- **WHEN** 页面渲染书签区域
- **THEN** 书签以水平行排列，每个书签显示小尺寸 favicon + 灰色名称文字

#### Scenario: 添加按钮保留
- **WHEN** 书签行渲染
- **THEN** 末尾显示 "+" 添加按钮，样式与书签一致但使用虚线边框
