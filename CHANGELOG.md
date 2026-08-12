# Changelog

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
