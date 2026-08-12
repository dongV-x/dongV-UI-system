import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as UI from "../dist/index.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("public exports include the agreed reusable surface", () => {
  const expected = ["AppDialogProvider", "ClassificationTag", "ContributionDonutChart", "DataTable", "Drawer", "EmptyState", "ErrorState", "HelpPopover", "LoadingState", "MetaTag", "Modal", "PageHeader", "PageTabs", "Select", "SingleSelect", "StatusBadge", "TableToolbar", "Toast", "Tooltip", "TrendAreaChart", "useAppDialog"];
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
    React.createElement(UI.LoadingState, null, "加载中"),
    React.createElement(UI.ErrorState, null, "加载失败"),
    React.createElement(UI.TrendAreaChart, null),
  ));
  assert.match(markup, /<header class="youpu-page-header"/);
  assert.match(markup, /role="dialog" aria-modal="true"/);
  assert.match(markup, /aria-label="详情"/);
  assert.match(markup, /aria-live="polite"/);
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


test("bounded containers and table cells keep a safe content inset", () => {
  const css = read("../src/components.css");
  const design = read("../DESIGN.md");
  assert.match(css, /\.youpu-data-table :is\(th, td\) \{[^}]*padding-block:[^}]*6px[^}]*padding-inline:[^}]*10px/s);
  assert.match(css, /\.youpu-empty-state,[^}]*padding: var\(--youpu-state-padding, 16px\)/s);
  assert.match(design, /表头和普通单元格默认横向 10px、纵向 6px/);
  assert.match(design, /标题、数值、状态或操作已经说清时不加重复副文案/);
});
