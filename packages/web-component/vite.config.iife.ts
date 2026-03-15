import { defineConfig } from "vite";

/**
 * Separate build config for the IIFE bundle.
 * Inlines @circa-input/core so the bundle is self-contained for CDN usage.
 */
export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["iife"],
      name: "CircaInput",
      fileName: () => "index.iife.js",
    },
    emptyOutDir: false,
    sourcemap: true,
  },
});
