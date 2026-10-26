# Changelog

## 1.7.0 - 2026-10-26

- TrendAreaChart 增加可选 `yAxisMode="focused"`，适度缩小纵轴范围、最多放大约 2 倍；默认轴、缺数、原值与交互不变。

## 1.6.0 - 2026-10-23

- 环图支持受控多选 `selectedKeys` / `onSelectionChange`，多个选中项同步强调，鼠标与键盘均可切换，保留单选API。

## 1.5.3 - 2026-10-23

- 趋势图只有一个有效数据点时也显示可见圆点；断线、零值、负值与键盘读数保持原口径。

## 1.5.2 - 2026-10-23

- compact环图支持 `--donut-compact-size` 尺寸变量（默认148px），让宿主保留既有尺寸而无需覆盖内部几何选择器；命中与绘制同步缩放。

## 1.5.1 - 2026-10-23

- `TrendAreaChart` 刻度省略末尾多余的零，例如100.00万改为100万；有意义的小数、负数、万/亿单位和千分位保留，金额浮层精度不变。

## 1.5.0 - 2026-10-23

### 新增

- `ContributionDonutChart` 的 `items` 支持可选 `icon`（React 节点），显示在色块与名称之间；不传时不留空位。
- `layout="compact"` 圆环由 168px 收到 148px、图例列距收紧，带图标时约 430px 宽也能放下四个字的名称；图例加上文字层次：名称常规字重、金额加粗、占比用次要色；色块改为小圆角方块。默认布局不变。来源：有谱「品类经营」环图右侧需要带品类图标、读起来分得出主次。

## 1.4.0 - 2026-10-23

### 新增

- `ContributionDonutChart` 新增 `layout="compact"`：圆环缩到 168px，图例去掉占比条、只留名称/金额/占比三列，约 430px 宽的窄栏也能保持「圆环左、图例右」。默认 `layout="standard"` 外观不变；手机宽度（≤720px）仍上下排列。来源：有谱「品类经营」联动带需要环图只占约三分之一宽，标准布局要 622px 才能并排。

## 1.3.0 - 2026-09-18

### 修复（含行为变化）

- `MultiSelect` / `SingleSelect`：下拉面板原来在控件内部做 `absolute` 定位，只要祖先里有 `overflow:hidden/auto/clip`（弹窗正文、滚动容器、带裁切的页面根），面板就会被裁掉一截或跟着滚动容器跑掉。现在和 `Select` 一样 Portal 到 `body`，用触发器的视口坐标做 `fixed` 定位：空间不够翻到上方，高度按可视空间给，祖先滚动/窗口缩放时跟随重定位。
- 配套新增：`MultiSelect` 的 `panelClassName`、`SingleSelect` 的 `menuClassName`。**面板不再位于控件内部，页面里 `.某容器 .youpu-multi-panel` 这类后代选择器不会再命中**，改用 `.youpu-multi-panel.自定义类` 或 `.youpu-single-select-menu.自定义类`（见 MIGRATION.md）。
- 修复 `SingleSelect` 的同类隐患：「点外部关闭」原来只判断控件本身，面板离开控件后会把点选项误判为点外部。

## 1.2.9 - 2026-09-18

### 修复

- `MultiSelect`：下拉面板原来用网格布局，选项多时列表按内容高度撑开（15 项实测 569px），而面板是 `max-height:356px` + `overflow:hidden` 的浮层，于是列表被裁、底部的取消/确认键被一起裁出面板——点不到确认，使用者只看到「选了没反应」。改为面板纵向 flex、列表 `flex:1 1 auto;min-height:0` 并保留 `overflow:auto`：列表自己滚，确认键常驻面板底部。实测（有谱「库存查询」15 个虚拟仓、1440 宽）：修复前确认键 y=769、面板只到 y=501；修复后列表高 264px 可滚、确认键 y=464 在面板内，端到端「取消 1 个仓 → 确认 → 查询只带这 14 个仓」通过。

## 1.2.8 - 2026-09-12

### 修复

- `MultiSelect`：`inline` 形态的标题行（`<legend>`）原来按内容收缩，`全选 / 清空` 上的 `margin-left:auto` 推不到右侧，按钮会贴在标题旁边。改为标题行占满整行。实测：容器 1095px 时标题行只有 248px 宽。

## 1.2.7 - 2026-09-12

### 修复

- `MultiSelect`：选项的焦点描边原来用 `:focus-within`，鼠标点一下也会画出一圈灰框并一直挂着，看起来像另一种选中态。改为只在键盘聚焦（`:focus-visible`）时显示，并补门禁防止退回。鼠标点击不再留下残留焦点环。

## 1.2.6 - 2026-09-12

### 修复

- `MultiSelect`：leading 元素的尺寸约束原来只作用在选项上，触发器里渲染 leading（已选 1 项时显示图标）时不受约束，512px 的图片会按自然尺寸铺满整个面板。改为在控件层约束 `img` / `svg`，并补一条门禁防止退回「只写选项层」。

## 1.2.5 - 2026-09-12

### 新增

- `MultiSelect`：多选控件。两种形态 `dropdown`（工具条省空间，草稿提交、取消/ESC/点外部回滚并归还焦点）与 `inline`（表单铺开，即时生效）；选项形态 `plain` / `card` / `chip`；支持全选、清空、必填标记与自定义计数文案。未选中保持中性、选中才着色，色调由 `--youpu-multi-tone` 决定且可按项覆盖（用于按人/按店配色）。

## Unreleased

## 1.2.4 - 2026-09-06

### 修复

- `AppDialog` 与 Modal、Drawer 共用同一浮层栈，嵌套确认框打开时底层正确移除 modal 语义并设为 inert。

## 1.2.3 - 2026-09-06

### 修复

- Modal 与 Drawer 嵌套时只有最上层保留 modal 语义和键盘响应，关闭后按层级归还焦点；Drawer 使用单一 dialog 语义。
- `TrendAreaChart` 的可聚焦数据点改为独立无障碍图形，读屏可读取每个点的名称和值。

## 1.2.2 - 2026-08-28

### 修复

- 移除错误的自依赖和误生成的运行时依赖，避免 GitHub Actions 在 `npm ci` 时从 npm registry 下载不存在的 `dongv-ui-system`。

## 1.2.1 - 2026-08-28

### 新增

- `HelpTip`：统一带问号的规则解释，支持悬停/聚焦显示、浮窗内停留与文本选择、离开/点击外部/Escape 关闭、视口定位和系统最高层级；短提示继续使用 `Tooltip`。

## 1.2.0 - 2026-08-23

### 新增

- **控件尺寸契约**：`Button`、`Input`、`Select` 统一支持 `table` 28px、`small` 30px、`compact` 32px、`medium` 36px、`large` 42px；`Select` 保留 `compactTable` 兼容入口。
- **LoadingState 表格骨架**：支持 `rows`、`columns`、`density`、`ariaLabel`，稳定容器高度并在 reduced-motion 下关闭 shimmer。
- **Textarea**：提供原生多行语义、`rows`、尺寸、校验态、resize 和描述关联。
- **Checkbox**：提供受控/非受控、indeterminate、禁用、标签关联和混合态无障碍语义。
- **DataTable 默认契约**：默认单元格居中、垂直居中、等宽数字和安全内边距。

### 兼容

- 未知尺寸回退到 `medium`；旧组件调用无需修改。
- `LoadingState` 未传 `children` 时使用新骨架，旧 children 行为保留。

## 1.1.1

### 新增

- **机器可读组件清单**：`COMPONENTS.md`（人读）+ `components.json`（机读），由 `npm run manifest` 从 `src/react/*.jsx` 自动生成并随包发布。
- 新增门禁「组件清单与源码同步」：清单与实际导出不一致或版本落后即测试失败。

### 为什么

接入方（含 AI）此前无法得知有哪些组件可用——包只发布 minified dist，读不出 props。
AI 写 `<select>` 往往不是不守规范，是**不知道有 `<Select>`**。
清单必须自动生成，手写清单三个月后必然腐化成「教错东西的参考页」。

## 1.1.0

### 新增

- `Button`：variant（primary/secondary/ghost/danger）、size、loading、icon。**带行为契约**——loading 期间真正 `disabled` 并 `aria-busy` 播报；`onClick` 返回 Promise 时自动防重复提交；默认 `type="button"` 避免误触发表单提交。
- `Input`：invalid 校验态（`aria-invalid`）、size、prefix/suffix 装饰位。
- `Field`：label 与控件通过 `useId` 自动关联；`error` 以 `role="alert"` 播报并接 `aria-describedby`；required 星号带 `aria-label`。支持 children 为函数以接收绑定属性。

### 为什么加这三个

接入方实测存在 436 处原生 `<button>`、67 处 `<input>`——不是不守规范，是这三类高频原子此前根本没有组件可用，规则无处落地。三者均以行为契约为主、样式为辅，避免重蹈只有 className 的样式壳（那样每个页面仍要重写行为，抽象等于没做）。

## 1.0.4 - 2026-08-12

- 为公共 DataTable 补充默认横纵安全间距和单行垂直居中，多行内容可显式顶部对齐。
- 为 LoadingState、EmptyState、ErrorState 增加 `inline / table / section / page` 四档布局，公共组件统一负责留白、最小高度和对齐。
- 收紧副文案准入：只允许说明限制、重要后果和异常恢复；无下一步的空状态只保留一句事实。

## 1.0.2 - 2026-08-10

- 将公共组件焦点从品牌红/粉红光圈改为中性焦点线。
- 分离 PageTabs、Select、SingleSelect 的焦点态与选中态，页签和下拉交互不再出现粉红底色。

## 1.0.1 - 2026-08-10

- 收口组件 CSS 作用域，避免修改宿主页面的普通元素、焦点和 reduced-motion。
- 校准 Select、HelpPopover 与 AppDialog 的 ARIA、唯一 ID 和描述引用。
- 说明 Tokens、React 组件、CSS 兼容层三档接入方式，以及 Release tgz 与源码 ZIP 的区别。
- 升级 GitHub Actions 到 Node 24 运行时对应的官方版本。

## 1.0.0 - 2026-08-09

- 建立 `--dv-*` 亮暗主题 Tokens 与 `--yp-*` 兼容层。
- 提供 React 18/19 的页面、表格、状态、Select、浮层、页面状态和图表组件。
- 保留 Escape、Tab 焦点圈定、焦点归还、ARIA 与 reduced-motion。
- 增加静态参考页、React 示例、测试、构建、打包和安全扫描。
