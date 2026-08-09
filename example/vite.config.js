import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(import.meta.dirname),
  build: { outDir: resolve(import.meta.dirname, "../dist-example"), emptyOutDir: true },
  server: { host: "127.0.0.1", port: 4174 },
});
