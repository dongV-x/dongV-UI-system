import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as UI from "../dist/index.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("public exports include the agreed reusable surface", () => {
  const expected = ["AppDialogProvider", "Button", "ClassificationTag", "ContributionDonutChart", "DataTable", "Drawer", "EmptyState", "ErrorState", "Field", "HelpPopover", "Input", "LoadingState", "MetaTag", "Modal", "PageHeader", "PageTabs", "Select", "SingleSelect", "StatusBadge", "TableToolbar", "Toast", "Tooltip", "TrendAreaChart", "useAppDialog"];
  assert.deepEqual(Object.keys(UI).sort(), expected.sort());
});

test("tokens keep the 1.0 baseline and generated CSS has no legacy source variables", () => {
  const tokens = JSON.parse(read("../src/tokens.json"));
  const css = read("../src/tokens.css");
  assert.equal(tokens.font.titleSize, "24px");
  assert.equal(tokens.layout.controlHeight, "36px");
  assert.equal(tokens.shape.panelRadius, "12px");
  assert.match(css, /--dv-font-title-size: 24px/);
  assert.doesNotMatch(css, /--yp-/);
});

test("Youpu compatibility aliases are generated from every public token", () => {
  const tokens = read("../src/tokens.css").match(/--dv-[a-z0-9-]+(?=:)/g) || [];
  const compat = read("../compat/youpu.css");
  assert.ok(tokens.length > 30);
  for (const token of new Set(tokens)) assert.match(compat, new RegExp(`--yp-${token.slice(5)}: var\\(${token}\\)`));
});

test("React primitives render semantic and accessible markup", () => {
  const markup = renderToStaticMarkup(React.createElement("main", null,
    React.createElement(UI.PageHeader, null, React.createElement("h1", null, "经营概览")),
    React.createElement(UI.PageTabs, { "aria-label": "页面切换" }, React.createElement("button", { type: "button" }, "总览")),
    React.createElement(UI.DataTable, { density: "compact" }, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, "示例")))),
    React.createElement(UI.StatusBadge, { tone: "success" }, "正常"),
    React.createElement(UI.Modal, { title: "确认操作", portalTarget: null }, React.createElement("button", { type: "button" }, "确认")),
    React.createElement(UI.Drawer, { ariaLabel: "详情", portalTarget: null }, React.createElement("button", { type: "button" }, "关闭")),
    React.createElement(UI.LoadingState, { scope: "inline" }, "加载中"),
    React.createElement(UI.EmptyState, { scope: "table" }, "暂无数据"),
    React.createElement(UI.EmptyState, null, "暂无内容"),
    React.createElement(UI.ErrorState, { scope: "page" }, "加载失败"),
    React.createElement(UI.TrendAreaChart, null),
  ));
  assert.match(markup, /<header class="youpu-page-header"/);
  assert.match(markup, /role="dialog" aria-modal="true"/);
  assert.match(markup, /aria-label="详情"/);
  assert.match(markup, /aria-live="polite"/);
  assert.match(markup, /data-scope="inline"/);
  assert.match(markup, /data-scope="table"/);
  assert.match(markup, /data-scope="section"/);
  assert.match(markup, /data-scope="page"/);
  assert.match(markup, /role="alert"/);
});

test("overlay source retains Escape, Tab trap and focus return", () => {
  const overlay = read("../src/react/YoupuUI.jsx");
  const dialog = read("../src/react/AppDialog.jsx");
  for (const source of [overlay, dialog]) {
    assert.match(source, /event\.key === "Escape"/);
    assert.match(source, /event\.key !== "Tab"/);
    assert.match(source, /previousFocusRef\.current/);
    assert.match(source, /aria-modal="true"/);
  }
});

test("component CSS stays inside the UI system instead of resetting the host page", () => {
  const css = read("../src/components.css");
  assert.doesNotMatch(css, /^\*, \*::before, \*::after/m);
  assert.doesNotMatch(css, /^:where\(button, input, select, textarea\)/m);
  assert.doesNotMatch(css, /prefers-reduced-motion: reduce\) \{ \*,/);
  assert.match(css, /\[class\*="youpu-"\]/);
});

test("focus styles stay neutral and never reuse brand selection fills", () => {
  const css = read("../src/components.css");
  const focusBlocks = [...css.matchAll(/([^{}]*:focus(?:-visible|-within)?[^{}]*)\{([^{}]*)\}/g)];
  assert.ok(focusBlocks.length > 5);
  for (const [, selector, body] of focusBlocks) {
    assert.doesNotMatch(body, /(?:background|box-shadow|outline|border-color)[^;]*(?:--dv-brand|--brand|brand-soft|225\s+38\s+28|215\s+47\s+38)/i, selector.trim());
  }
  assert.match(css, /\.youpu-page-tabs > button:focus-visible \{ outline: 2px solid var\(--dv-text-muted\)/);
  assert.match(css, /\.youpu-page-tabs > button\.active \{[^}]*background: transparent/s);
  assert.match(css, /\.youpu-select-trigger:hover:not\(:disabled\) \{ border-color: var\(--dv-border-strong\)/);
});

test("Select and help containers expose honest ARIA contracts", () => {
  const select = renderToStaticMarkup(React.createElement(UI.Select, {
    ariaLabel: "选择店铺",
    options: [{ value: "all", label: "全部店铺" }],
    value: "all",
  }));
  const help = renderToStaticMarkup(React.createElement(UI.HelpPopover, null, "帮助内容"));
  const explicitHelp = renderToStaticMarkup(React.createElement(UI.HelpPopover, { role: "note" }, "帮助内容"));
  assert.match(select, /role="combobox"/);
  assert.match(select, /aria-autocomplete="none"/);
  assert.match(select, /aria-controls=/);
  assert.match(read("../src/react/YoupuUI.jsx"), /if \(next >= 0\) setActiveIndex\(next\)/);
  assert.doesNotMatch(help, /role="tooltip"/);
  assert.match(explicitHelp, /role="note"/);
});

test("AppDialog uses unique IDs and only references a rendered description", () => {
  const dialog = read("../src/react/AppDialog.jsx");
  assert.match(dialog, /React\.useId\(\)/);
  assert.match(dialog, /aria-describedby=\{dialog\.description \? descriptionId : undefined\}/);
  assert.doesNotMatch(dialog, /id="youpu-dialog-(title|description)"/);
});


test("tables and page states keep safe alignment and spacing defaults", () => {
  const css = read("../src/components.css");
  const design = read("../DESIGN.md");
  assert.match(css, /\.youpu-data-table :is\(th, td\) \{[^}]*padding-block:[^}]*6px[^}]*padding-inline:[^}]*10px[^}]*vertical-align: middle/s);
  assert.match(css, /data-vertical-align="top"[^}]*vertical-align: top/);
  assert.match(css, /\.youpu-empty-state,[^}]*display: grid[^}]*align-content: center[^}]*justify-items: center[^}]*padding: var\(--youpu-state-padding, 24px\)/s);
  assert.match(css, /data-scope="inline"[^}]*justify-items: start[^}]*text-align: left/s);
  assert.match(css, /data-scope="table"[^}]*160px[^}]*24px/s);
  assert.match(css, /data-scope="page"[^}]*360px[^}]*48px 24px/s);
  assert.match(design, /表头和普通单元格默认横向 10px、纵向 6px/);
  assert.match(design, /inline.*table.*section.*page/s);
  assert.match(design, /标题、数值、状态或操作已经说清时不加重复副文案/);
});


test("Button 承载行为契约：loading 禁用并播报、异步 onClick 防重复提交", async () => {
  const source = read("../src/react/YoupuUI.jsx");
  // 契约必须在实现里，不能只是样式壳——DataTable 的教训是每页都要重写行为。
  assert.match(source, /busyRef/, "Button 必须实现防重复提交");
  assert.match(source, /aria-busy=\{loading \|\| undefined\}/, "loading 必须对辅助技术播报");
  assert.match(source, /disabled=\{isDisabled\}/, "loading 期间必须真正禁用");

  const html = renderToStaticMarkup(React.createElement(UI.Button, { loading: true }, "保存"));
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /disabled/);
  assert.match(html, /youpu-button-spinner/);

  const plain = renderToStaticMarkup(React.createElement(UI.Button, { variant: "primary" }, "保存"));
  assert.match(plain, /class="youpu-button is-primary is-medium"/);
  assert.match(plain, /type="button"/, "默认 type=button，避免误触发表单提交");
});

test("Input 表达校验态，Field 关联 label 与错误信息", () => {
  const invalid = renderToStaticMarkup(React.createElement(UI.Input, { invalid: true, placeholder: "金额" }));
  assert.match(invalid, /aria-invalid="true"/);
  assert.match(invalid, /is-invalid/);

  const field = renderToStaticMarkup(
    React.createElement(UI.Field, { label: "店铺", required: true, error: "请选择店铺" },
      (bind) => React.createElement("input", { ...bind })),
  );
  assert.match(field, /<label[^>]*for="([^"]+)"/, "label 必须绑定控件");
  const id = field.match(/<label[^>]*for="([^"]+)"/)[1];
  assert.ok(field.includes(`id="${id}"`), "控件 id 必须与 label 的 for 一致");
  assert.match(field, /role="alert"/, "错误信息必须即时播报");
  assert.match(field, /aria-describedby="[^"]*-error"/);
  assert.match(field, /aria-label="必填"/);
});

test("三个原子的样式只取用 token，不写死尺寸与颜色", () => {
  const css = read("../src/components.css");
  const block = css.slice(css.indexOf(".youpu-button{"));
  assert.match(block, /height:var\(--dv-control-height\)/);
  assert.match(block, /border-radius:var\(--dv-radius-control\)/);
  assert.match(block, /background:var\(--dv-brand\)/);
  // 允许 #fff（品牌底上的前景色）与少量档位尺寸，但禁止其它写死色值
  const hex = [...block.matchAll(/#[0-9a-fA-F]{3,6}/g)].map((m) => m[0].toLowerCase());
  assert.deepEqual([...new Set(hex)], ["#fff"], "除品牌底上的白字外不得出现写死色值");
});

test("组件清单与源码同步：新增/删除组件必须重新生成清单", () => {
  // 清单腐化是设计系统的典型死法——文档说有 A 组件，实际早改名了，
  // AI 照着写就一定错。这条门禁保证 COMPONENTS.md 永远等于 src/react 的真实导出。
  const manifest = JSON.parse(read("../components.json"));
  const manifestNames = manifest.components.map((c) => c.name).sort();
  const exportNames = Object.keys(UI).filter((k) => /^[A-Z]/.test(k)).sort();
  assert.deepEqual(
    manifestNames.filter((n) => exportNames.includes(n)),
    exportNames,
    "components.json 与实际导出不一致，请运行 npm run manifest",
  );
  assert.equal(manifest.version, JSON.parse(read("../package.json")).version, "清单版本落后，请运行 npm run manifest");

  const md = read("../COMPONENTS.md");
  for (const name of exportNames) {
    assert.ok(md.includes(`**${name}**`), `COMPONENTS.md 缺少 ${name}`);
  }
});
