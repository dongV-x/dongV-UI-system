/* 从组件源码自动生成机器可读清单（COMPONENTS.md + components.json）。
   为什么必须自动生成：手写清单三个月后必然与实现脱节，变成第二个「教错东西的参考页」。
   为什么要随包发布：消费方装到的是 minified dist，无法从中提取 props；
   清单在这里生成、随包分发，接入方（含 AI）才有唯一可信的组件目录。 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const reactDir = join(root, "src", "react");

/** 从 `export function Name({ a = 1, b, ...rest })` 提取组件名与 props */
function parseComponents(source, file) {
  const out = [];
  const re = /(?:\/\*\*([\s\S]*?)\*\/\s*)?export (?:default )?function ([A-Z][A-Za-z0-9]*)\s*\(\s*(\{[\s\S]*?\})?\s*\)/g;
  let m;
  while ((m = re.exec(source))) {
    const [, doc, name, propsBlock] = m;
    const props = [];
    if (propsBlock) {
      // 逐个顶层键解析，跳过嵌套默认值里的逗号
      let depth = 0, buf = "";
      for (const ch of propsBlock.slice(1, -1)) {
        if ("{[(".includes(ch)) depth += 1;
        if ("}])".includes(ch)) depth -= 1;
        if (ch === "," && depth === 0) { props.push(buf.trim()); buf = ""; continue; }
        buf += ch;
      }
      if (buf.trim()) props.push(buf.trim());
    }
    out.push({
      name,
      file: `src/react/${file}`,
      doc: (doc || "").split("\n").map((l) => l.replace(/^\s*\*?\s?/, "")).join(" ").trim(),
      props: props
        .filter((p) => p && !p.startsWith("..."))
        .map((p) => {
          const [key, ...rest] = p.split("=");
          return { name: key.trim().replace(/:.*$/, ""), default: rest.join("=").trim() || null };
        }),
      rest: props.some((p) => p.startsWith("...")),
    });
  }
  return out;
}

const components = readdirSync(reactDir)
  .filter((f) => f.endsWith(".jsx"))
  .flatMap((f) => parseComponents(readFileSync(join(reactDir, f), "utf8"), f))
  .sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(join(root, "components.json"), JSON.stringify({ version: JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version, components }, null, 2) + "\n");

const lines = [
  "# 组件清单（自动生成，勿手改）",
  "",
  "由 `npm run manifest` 从 `src/react/*.jsx` 生成。**新增组件前先查这里**，不要因为「没找到」就写原生标签。",
  "",
  `共 ${components.length} 个导出组件。`,
  "",
  "| 组件 | props | 说明 |",
  "|---|---|---|",
];
for (const c of components) {
  const props = c.props.length
    ? c.props.map((p) => (p.default ? `\`${p.name}\`=${p.default}` : `\`${p.name}\``)).join("、")
    : "—";
  lines.push(`| **${c.name}** | ${props}${c.rest ? " + 透传" : ""} | ${c.doc || ""} |`);
}
lines.push("", "## 使用纪律", "",
  "- 页面**不得**直接写 `<button>` / `<input>` / `<select>` / `<table>`——用上表组件。",
  "- 需要新变体时在本包新增 variant，**不要**在业务侧写原生标签加 class。",
  "- 组件样式一律取用 token；业务侧不得用 `style={{}}` 覆盖组件内部尺寸与颜色。", "");
writeFileSync(join(root, "COMPONENTS.md"), lines.join("\n"));
console.log(`清单已生成：${components.length} 个组件 → COMPONENTS.md + components.json`);
