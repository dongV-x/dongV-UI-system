# Changelog

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
