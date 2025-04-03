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
  return {
    name: "dev-virtual-api",
    async configureServer(server) {
      const schemaPath = "../../__dev/schema.graphql";
      const stateFilesPath = "../../__dev/states/";

      function getAndCompileSchema() {
        return fs.readFile(schemaPath, "utf-8").then(toStructype);
      }

      const schema = await getAndCompileSchema();
      const virtualServer = createVirtualServer({
        schema,
        api: {
          createStateFile: async (file: { path: string; content: string }) => {
            await fs.writeFile(stateFilesPath + file.path, file.content);
            virtualServer.createdStateFile(file);
          },
          deleteStateFile: async (file: { path: string }) => {
            await fs.unlink(stateFilesPath + file.path);
            virtualServer.deletedStateFile(file.path);
          },
          updateStateFile: async (file: { path: string; content: string }) => {
            await fs.writeFile(stateFilesPath + file.path, file.content);
            virtualServer.updatedStateFile(file);
          },
        },
      });

      chokidar.watch(schemaPath).on("change", async () => {
        const schema = await getAndCompileSchema();
        virtualServer.setSchema(schema);
      });

      chokidar.watch(stateFilesPath).on("all", async (event, realPath) => {
        const path = realPath.replace(stateFilesPath, "");
        switch (event) {
          case "add": {
            const content = await fs.readFile(realPath, "utf-8");
            virtualServer.createdStateFile({ path, content });
            break;
          }
          case "unlink": {
            virtualServer.deletedStateFile(path);
            break;
          }
          case "change": {
            const content = await fs.readFile(realPath, "utf-8");
            virtualServer.updatedStateFile({ path, content });
            break;
          }
        }
      });

      server.middlewares.use(virtualServer.createRequestHandler());
    },
  };
};

export default defineConfig({
  server: {
    port: 1342,
  },
  build: {
    lib: {
      entry: "src/index.tsx",
      fileName: "index.mjs",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "monaco-editor",
        "monaco-editor/esm/vs/editor/editor.worker?worker",
        "monaco-editor/esm/vs/language/json/json.worker?worker",
        "monaco-editor/esm/vs/language/typescript/ts.worker?worker",
        "graphql",
        "graphiql",
        "graphiql/graphiql.css",
      ],
    },
    cssMinify: true,
  },
  plugins: [
    tailwindcss(),
    react(),
    tsconfigPaths(),
    dtsPlugin({ rollupTypes: true }),
    devVirtualAPIPlugin(),
  ],
});
