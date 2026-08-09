import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = new URL("../", import.meta.url);
const rootPath = decodeURIComponent(root.pathname);
const ignored = new Set([".git", "node_modules", "dist", "dist-example"]);
const forbiddenExtensions = new Set([".db", ".sqlite", ".xlsx", ".xls", ".zip", ".pem", ".key"]);
const sensitive = [new RegExp("gh" + "p_[A-Za-z0-9]{20,}"), new RegExp("sk" + "-[A-Za-z0-9]{20,}"), /BEGIN [A-Z ]*PRIVATE KEY/, /AIza[0-9A-Za-z_-]{30,}/];
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path); else files.push(path);
  }
}
walk(rootPath);
const failures = [];
for (const file of files) {
  const rel = relative(rootPath, file);
  const size = statSync(file).size;
  if (size > 5 * 1024 * 1024) failures.push(`${rel}: larger than 5 MB`);
  if (forbiddenExtensions.has(extname(file).toLowerCase()) || entryName(rel) === ".env") failures.push(`${rel}: forbidden file type`);
  if (/\.(png|jpe?g|webp|gif)$/i.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const pattern of sensitive) if (pattern.test(text)) failures.push(`${rel}: sensitive pattern ${pattern}`);
}
const tests = files.filter((file) => /tests\/.*\.test\.mjs$/.test(file)).map((file) => readFileSync(file, "utf8")).join("\n");
if (/\.(skip|todo)\s*\(/.test(tests)) failures.push("tests: skip/todo is forbidden");
const packageJson = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
if (packageJson.dependencies?.["@arco-design/web-react"] || packageJson.peerDependencies?.["@arco-design/web-react"]) failures.push("package.json: Arco cannot be a core dependency");
function entryName(path) { return path.split("/").at(-1); }
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Repository scan passed: ${files.length} files, no sensitive or oversized release files, skipped/todo 0`);
