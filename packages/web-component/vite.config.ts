import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      fileName: "index",
    },
    sourcemap: true,
    rollupOptions: {
      external: ["@circa-input/core"],
    },
  },
  plugins: [dts({ rollupTypes: true })],
  test: {
    globals: true,
    environment: "happy-dom",
  },
});
