import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.js"),
      formats: ["es"],
      fileName: () => "index.js",
      cssFileName: "components",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client"],
    },
  },
});
