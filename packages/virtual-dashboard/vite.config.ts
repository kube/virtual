import { toStructype } from "@kube/structype-graphql";
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

  let currentSchema = await getAndCompileSchema();

  return {
    name: "dev-virtual-api",
    transformIndexHtml(html) {
      return html.replace(
        "</head>",
        `<script language="javascript">
          window.__VIRTUAL_SCHEMA = ${JSON.stringify(currentSchema)}
          </script>
        </head>`
      );
    },
    async configureServer(server) {
      chokidar.watch(schemaPath).on("change", async () => {
        const newSchema = await getAndCompileSchema();
        currentSchema = newSchema;
        server.ws.send({
          type: "custom",
          event: "virtual-server-api",
          data: newSchema,
        });
      });
    },
  };
};

export default defineConfig(({ mode }) => ({
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
}));
