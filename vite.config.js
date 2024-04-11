import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        account: resolve(__dirname, "src/account.html"),
        course: resolve(__dirname, "src/course.html"),
        dashboard: resolve(__dirname, "src/index.html")
      },
    },
  },
});
