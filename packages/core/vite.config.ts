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
  },
  plugins: [dts({ rollupTypes: true })],
  test: {
    globals: true,
  },
});
