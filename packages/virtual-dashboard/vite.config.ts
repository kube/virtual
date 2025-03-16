import { toStructype } from "@kube/structype-graphql";
import { createVirtualServer } from "@kube/virtual";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import chokidar from "chokidar";
import fs from "node:fs/promises";
import { defineConfig, type Plugin } from "vite";
import dtsPlugin from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

// A little plugin for development to simulate
// a VirtualServer and CLI with watchers etc...
const devVirtualAPIPlugin = async (): Promise<Plugin> => {
  const schemaPath = "./dev/schema.graphql";

  function getAndCompileSchema() {
    return fs.readFile(schemaPath, "utf-8").then(toStructype);
  }

  const schema = await getAndCompileSchema();
  const virtualServer = createVirtualServer({ schema });

  chokidar.watch(schemaPath).on("change", async () => {
    const schema = await getAndCompileSchema();
    virtualServer.setSchema(schema);
  });

  return {
    name: "dev-virtual-api",
    async configureServer(server) {
      server.middlewares.use(virtualServer.createRequestHandler());
    },
  };
};

export default defineConfig({
  server: {
    port: 1342,
    watch: {
      ignored: ["**/schema.graphql"],
    },
  },
  build: {
    lib: {
      entry: "src/index.tsx",
      fileName: "index.mjs",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    tsconfigPaths(),
    devVirtualAPIPlugin(),
    dtsPlugin(), // TODO: Make DTS Bundle
  ],
});
