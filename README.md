# dongV UI System

面向桌面 Web 运营/管理系统的轻量 UI 基线：**框架无关 Tokens/CSS + React 18/19 组件**。它来自有谱正式页面的真实使用，不包含任何业务路由、接口或数据。

## 先选接入方式

| 方式 | 适合谁 | 复杂度 |
|---|---|---|
| 只用 Tokens | 已有项目，只想统一颜色、字号、圆角和间距 | 最低，推荐先从这里开始 |
| Tokens + React 组件 | 新建或正在整理的 React 桌面运营系统 | 中等，按需导入组件 |
| Tokens + CSS class | 非 React 或有谱兼容项目 | 较高，需要使用历史 `youpu-*` class |

适合桌面运营后台、管理工具和数据工作台；不适合移动原生应用、营销落地页，也不是开箱即用的完整业务模板。页面级交互优先使用本包组件；只有尚未形成稳定行为契约的业务特例才保留原生控件。

## 可以直接分享吗

可以直接分享 GitHub 仓库，但安装时应使用 Release 中的 `.tgz`。本包尚未发布到 npm registry，因此不能直接执行 `npm install dongv-ui-system`。GitHub 自动生成的 Source code ZIP 面向贡献者，未包含构建后的 `dist/`；从源码开发需先运行 `npm ci && npm run build`。

## 普通使用者

从 GitHub Release 下载 `dongv-ui-system-1.2.0.tgz`，然后安装：

```bash
npm install ./dongv-ui-system-1.2.0.tgz
```

也可直接安装公开 Release：

```bash
npm install https://github.com/dongV-x/dongV-UI-system/releases/download/v1.2.0/dongv-ui-system-1.2.0.tgz
```

## React 项目

```jsx
import { PageHeader, DataTable, EmptyState, StatusBadge } from "dongv-ui-system/react";
import "dongv-ui-system/tokens.css";
import "dongv-ui-system/components.css";
```

```jsx
<PageHeader><h1>经营概览</h1></PageHeader>
<DataTable density="standard">...</DataTable>
<EmptyState scope="table">暂无数据</EmptyState>
<StatusBadge tone="success">正常</StatusBadge>
```

React 和 ReactDOM 由项目提供，支持 18.2 至 19.x。核心没有 Arco 依赖。

## CSS-only 项目

```css
@import "dongv-ui-system/tokens.css";
@import "dongv-ui-system/components.css";
```

Tokens 使用 `--dv-*`，例如：

```css
:root { --dv-brand: #7c3aed; }
```

CSS-only 可直接使用与 React 输出一致的稳定 class，例如 `youpu-page-header`、`youpu-data-table`。V1 保留这些历史 class 只为兼容；公开品牌和可配置 API 均为 dongV。

## AI Agent

把仓库根目录 `AGENTS.md` 作为入口。新页面先读 `DESIGN.md` 和 `PAGE-TEMPLATES.md`，只复用当前已有组件；不要复制示例页，也不要把单页特例提前做成通用组件。

## 版本升级

把下方 `<version>` 替换为 Release 页面中真实存在的版本号：

```text
https://github.com/dongV-x/dongV-UI-system/releases/download/v<version>/dongv-ui-system-<version>.tgz
```

- patch：修复与向后兼容的小改进；
- minor：新增兼容组件或 Token；
- major：删除或改变现有 API。

升级前读 `CHANGELOG.md` 和 `MIGRATION.md`，升级后运行项目测试、生产构建和代表页面验收。

## 可用入口

| 入口 | 用途 |
|---|---|
| `dongv-ui-system/react` | React 组件 |
| `dongv-ui-system/tokens.css` | 亮暗主题 Token |
| `dongv-ui-system/tokens.json` | 工具读取的 Token 源 |
| `dongv-ui-system/components.css` | 组件样式 |
| `dongv-ui-system/compat/youpu.css` | 原 `--yp-*` 兼容映射 |

## 本仓库验证

```bash
npm ci
npm run check
```

`npm run check` 会检查 Token 漂移、组件测试、库和示例构建、敏感/大文件、skipped/todo=0 和打包清单。
