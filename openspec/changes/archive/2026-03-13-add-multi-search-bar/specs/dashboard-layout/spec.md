## MODIFIED Requirements

### Requirement: 标题和底部工具栏位置
页面标题 SHALL 保持在页面顶部。搜索栏 SHALL 位于标题下方、内容区（dashboard-grid）上方。刷新按钮和最后更新时间 SHALL 位于内容区域底部。

#### Scenario: 标题位置
- **WHEN** 用户打开新标签页
- **THEN** "AI Pulse Tab" 标题显示在页面顶部居中位置

#### Scenario: 搜索栏位置
- **WHEN** 用户打开新标签页
- **THEN** 搜索栏显示在标题下方、Provider 卡片和书签区域上方，宽度与内容区一致

#### Scenario: 底部工具栏
- **WHEN** 用户打开新标签页
- **THEN** 刷新按钮和最后更新时间显示在内容区域下方
