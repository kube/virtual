import { reactRouter } from "@react-router/dev/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths(), vanillaExtractPlugin()],
});
