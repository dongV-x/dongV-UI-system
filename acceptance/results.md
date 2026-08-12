# V1 验收结果

| ID | 状态 | 直接证据 |
|---|---|---|
| RULE-01 | pass | 人工追加 `src/tokens.css` 漂移后 `npm run tokens:check` exit 1；还原后通过 |
| RULE-02 | pass | Token 测试通过；内置浏览器实测标题 24px、控件 36px、面板圆角 12px |
| COMP-01 | pass | `node --test tests/*.test.mjs`：5/5，fail/skipped/todo 均为 0 |
| COMP-02 | pass | 内置浏览器逐项验证 Modal、Drawer、AppDialog 的 Escape、Tab 圈定、焦点归还和 ARIA |
| A11Y-01 | pass | CSS 参考页与 tgz smoke 页在 1440/960、亮/暗主题均无整页横向溢出；Console 0 error/warn |
| DESIGN-01 | pass | `reference/index.html` 与 React 示例完成浏览器验收；8 张页面母版基准图已保留 |
| SMOKE-01 | pass | 全新 `/tmp/dongv-ui-system-smoke` 安装 1.0.0 tgz，Vite 生产构建通过，27 modules transformed |
| PKG-01 | pass | React/ReactDOM 18.3.1 与 19.2.8 均通过 5 项测试和生产构建 |
| PKG-02 | pass | smoke 项目从 1.0.0 安装到临时 1.0.1，`npm ls` 显示 1.0.1，生产构建通过，再恢复 1.0.0 |
| SEC-01 | pass | `npm run scan`：47 files，无敏感/超大/禁用文件，skipped/todo 0；tgz 12 files、19.5 kB |
| SYNC-01 | pass | 有谱锁定 v1.0.0 Release tgz，React/CSS 改为公共包和薄转发；有谱 61/61、3965 modules、文档及内置浏览器验收通过；PR：https://github.com/dongV-x/youpu/pull/1 |
| DELIVERY-01 | pass | 公开仓库、`v1.0.0` Tag、tgz/zip Release 和未合并的有谱 PR 均存在；Release：https://github.com/dongV-x/dongV-UI-system/releases/tag/v1.0.0；CI：https://github.com/dongV-x/dongV-UI-system/actions/runs/31329041466 |

## 1.0.2 焦点样式补丁

| ID | 状态 | 直接证据 |
|---|---|---|
| FOCUS-01 | pass | `npm run check`：9/9 tests、library/example build、scan、pack dry-run 全部通过 |
| FOCUS-02 | pass | Codex 内置浏览器 1440 亮色：未选中页签背景透明、焦点为 `#6d7684` 2px；Select 聚焦边框 `#cfd6e2`、无阴影、无粉红底色 |
| FOCUS-03 | pass | Codex 内置浏览器 960 暗色：Select 背景 `#22262d`、边框 `#4c5664`、焦点 `#a7afb9` 2px、横向溢出 0，Console 无 warning/error |


## 1.0.4 状态、表格与文案护栏

| ID | 状态 | 直接证据 |
|---|---|---|
| STATE-01 | pass | Codex 内置浏览器实测 960 亮/暗：inline 8px 0 左对齐；table 160px/24px；section 120px/24px；page 360px/48px 24px；整页横向溢出 0 |
| TABLE-01 | pass | Codex 内置浏览器实测普通单元格 padding 6px 10px、vertical-align middle；多行示例 data-vertical-align=top 生效 |
| COPY-01 | pass | DESIGN.md 固化副文案三类准入、无动作空状态一句事实和技术详情边界；示例状态不使用重复说明 |
| PKG-03 | pass | `npm run check`：10/10 tests、library/example build、scan、pack dry-run 全部通过；包 12 files、22.1 kB |
| A11Y-02 | pass | Codex 内置浏览器 960 亮/暗主题均无横向溢出，Console 无 warning/error |
