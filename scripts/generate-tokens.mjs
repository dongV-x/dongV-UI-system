import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const input = new URL("src/tokens.json", root);
const cssOutput = new URL("src/tokens.css", root);
const compatOutput = new URL("compat/youpu.css", root);
const tokens = JSON.parse(readFileSync(input, "utf8"));

const base = [
  ["font-sans", tokens.font.family], ["font-body-size", tokens.font.bodySize], ["font-body-weight", tokens.font.bodyWeight],
  ["font-title-size", tokens.font.titleSize], ["font-title-weight", tokens.font.titleWeight], ["font-title-line-height", tokens.font.titleLineHeight],
  ["page-canvas-max-width", tokens.layout.pageCanvasMaxWidth], ["desktop-min-width", tokens.layout.desktopMinWidth],
  ["title-bar-min-height", tokens.layout.titleBarMinHeight], ["control-height", tokens.layout.controlHeight], ["tab-height", tokens.layout.tabHeight],
  ["table-header-height", tokens.layout.tableHeaderHeight], ["table-row-height", tokens.layout.tableRowHeight],
  ["table-row-height-compact", tokens.layout.tableRowHeightCompact], ["table-row-height-standard", tokens.layout.tableRowHeightStandard],
  ["table-row-height-product", tokens.layout.tableRowHeightProduct], ["radius-control", tokens.shape.controlRadius],
  ["radius-panel", tokens.shape.panelRadius], ["radius-floating", tokens.shape.floatingRadius],
  ["motion-fast", tokens.motion.fast], ["motion-normal", tokens.motion.normal], ["motion-slow", tokens.motion.slow],
];
const semantic = [
  ["brand", "brand"], ["brand-soft", "brandSoft"], ["page-bg", "pageBg"], ["stage-bg", "stageBg"],
  ["surface", "surface"], ["surface-raised", "surfaceRaised"], ["surface-soft", "surfaceSoft"],
  ["text", "text"], ["text-muted", "textMuted"], ["border", "border"], ["border-strong", "borderStrong"],
  ["success", "success"], ["success-soft", "successSoft"], ["warning", "warning"], ["warning-soft", "warningSoft"],
  ["danger", "danger"], ["danger-soft", "dangerSoft"], ["info", "info"], ["info-soft", "infoSoft"],
  ["disabled", "disabled"], ["comparison-positive", "comparisonPositive"], ["comparison-negative", "comparisonNegative"],
];
const shadows = [["card", "card"], ["hover", "hover"], ["overlay", "overlay"], ["panel", "panel"]];
const names = [...base.map(([name]) => name), ...semantic.map(([name]) => name), ...shadows.map(([name]) => `shadow-${name}`), "shadow-floating"];
const lines = (pairs, prefix = "dv") => pairs.map(([name, value]) => `  --${prefix}-${name}: ${value};`).join("\n");
const theme = (mode) => [
  ...semantic.map(([name, key]) => [name, tokens.color[key][mode]]),
  ...shadows.map(([name, key]) => [`shadow-${name}`, tokens.shadow[key][mode]]),
];
const css = `/* Generated from src/tokens.json by scripts/generate-tokens.mjs. Do not edit directly. */\n:root {\n  color-scheme: light;\n${lines(base)}\n\n${lines(theme("light"))}\n  --dv-shadow-floating: var(--dv-shadow-overlay);\n}\n\nhtml[data-theme="dark"], [data-theme="dark"] {\n  color-scheme: dark;\n${lines(theme("dark"))}\n  --dv-shadow-floating: var(--dv-shadow-overlay);\n}\n`;
const compat = `/* Generated compatibility aliases. Load after tokens.css. Do not edit directly. */\n:root {\n${names.map((name) => `  --yp-${name}: var(--dv-${name});`).join("\n")}\n}\n`;

const outputs = [[cssOutput, css, "tokens.css"], [compatOutput, compat, "compat/youpu.css"]];
if (process.argv.includes("--check")) {
  for (const [file, expected] of outputs) {
    if (readFileSync(file, "utf8") !== expected) {
      console.error(`Token drift: ${fileURLToPath(file)} is not generated from src/tokens.json`);
      process.exit(1);
    }
  }
  console.log("Token check passed: generated CSS matches src/tokens.json");
} else {
  for (const [file, content, label] of outputs) {
    writeFileSync(file, content);
    console.log(`Generated ${label}`);
  }
}
