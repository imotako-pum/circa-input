import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "@circa-input/core",
        "@circa-input/web-component",
        "react",
        "react-dom",
        "react/jsx-runtime",
      ],
    },
  },
  plugins: [dts({ rollupTypes: true, exclude: ["src/__tests__"] })],
  test: {
    globals: true,
    environment: "happy-dom",
  },
});
