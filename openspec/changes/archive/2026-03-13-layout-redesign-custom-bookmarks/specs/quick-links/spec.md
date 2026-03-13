## MODIFIED Requirements

### Requirement: 快捷链接区域展示
页面 SHALL 在书签区域展示用户自定义的书签列表。书签区域 SHALL 使用自适应网格布局，根据书签数量和容器宽度自动调整列数。书签区域末尾 SHALL 显示一个"+"添加按钮。

#### Scenario: 书签区域可见
- **WHEN** 用户打开新标签页
- **THEN** 页面显示书签网格区域，包含用户保存的所有书签和一个"+"添加按钮

#### Scenario: 自适应网格列数
- **WHEN** 书签数量从 4 个增加到 12 个
- **THEN** 网格自动调整列数以适应容器宽度，书签排列整齐

### MODIFIED Requirements

### Requirement: 预设网站列表
书签区域 SHALL 在首次使用时显示默认预设书签（Claude、ChatGPT、Douyu、X）。用户 SHALL 可以修改或删除这些默认书签，也可以添加新书签。

#### Scenario: 首次展示预设书签
- **WHEN** 用户首次安装扩展并打开新标签页
- **THEN** 书签区域显示 4 个默认书签卡片，每个包含网站名称和图标字母

#### Scenario: 用户自定义后展示
- **WHEN** 用户已删除 Douyu 并添加了 GitHub 书签
- **THEN** 书签区域显示 Claude、ChatGPT、X、GitHub 四个书签

## REMOVED Requirements

### Requirement: 快捷链接像素风格
**Reason**: 此需求被 `custom-bookmarks` 和 `pixel-theme` 的相关需求替代。书签卡片的像素风格继续保持，但具体样式随书签组件重写而在新需求中定义。
**Migration**: 像素风格通过 `pixel-theme` 的修改需求继续保障。
