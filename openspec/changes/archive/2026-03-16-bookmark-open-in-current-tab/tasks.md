## 1. 书签导航方式修改

- [x] 1.1 修改 `components/BookmarkGrid.tsx`：将书签 `<a>` 标签的 `target="_blank"` 移除，改为 onClick 事件处理使用 `window.location.href` 在当前标签页导航

## 2. 搜索导航方式修改

- [x] 2.1 修改 `components/SearchBar.tsx`：将 `window.open(url, '_blank')` 改为 `window.location.href = url`

## 3. 验证

- [x] 3.1 手动测试书签点击在当前标签页中打开
- [x] 3.2 手动测试搜索提交在当前标签页中跳转
- [x] 3.3 确认 ProviderCard 登录链接仍在新标签页打开（未受影响）
