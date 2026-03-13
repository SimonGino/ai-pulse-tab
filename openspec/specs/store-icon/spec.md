### Requirement: 商店图标完整填充画布
商店图标（store-128.png）SHALL 完全填充 128×128 像素画布，不得存在透明像素间隙或边距。

#### Scenario: 图标无透明边距
- **WHEN** 查看 store-128.png 的像素数据
- **THEN** 图标四边边缘像素均为非透明（alpha = 255）

#### Scenario: 图标尺寸正确
- **WHEN** 检查 store-128.png 文件属性
- **THEN** 图像尺寸 SHALL 为 128×128 像素

### Requirement: 多尺寸图标一致性
系统 SHALL 提供 16×16、32×32、48×48、96×96、128×128 五种尺寸的图标，所有尺寸 MUST 保持相同的设计元素和配色。

#### Scenario: 所有尺寸文件存在
- **WHEN** 检查 public/icon/ 目录
- **THEN** SHALL 包含 16.png、32.png、48.png、96.png、128.png 和 store-128.png

#### Scenario: 各尺寸视觉一致
- **WHEN** 比较不同尺寸的图标
- **THEN** 所有尺寸 SHALL 使用相同的配色方案和核心设计元素（脉冲波形 + Pac-Man）

### Requirement: 图标设计风格
图标 SHALL 保留像素风/复古风格，包含心电图脉冲波形和 Pac-Man 吃豆人元素，使用深色背景。

#### Scenario: 设计元素完整
- **WHEN** 查看生成的图标
- **THEN** SHALL 包含可识别的心电图脉冲线和 Pac-Man 造型

#### Scenario: 深色背景填充
- **WHEN** 查看图标背景
- **THEN** 背景 SHALL 为深色（近黑色），完全覆盖画布，可带圆角

### Requirement: 图标文件格式
所有图标文件 SHALL 为 PNG 格式，使用 RGBA 色彩空间。

#### Scenario: 文件格式正确
- **WHEN** 检查图标文件格式
- **THEN** 所有图标 SHALL 为 PNG 格式且支持 alpha 通道
