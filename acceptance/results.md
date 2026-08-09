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
| SYNC-01 | pending | 待 GitHub Release 后让优谱安装同一 tgz |
| DELIVERY-01 | pending | 待公开仓库、v1.0.0 Release 和优谱 PR |
