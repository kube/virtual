import { createRequestHandler } from "@react-router/express";
import chokidar from "chokidar";
import express from "express";
import path from "path";
import "react-router";

import type { Schema_Index } from "@kube/structype";
import { toStructype } from "@kube/structype-graphql";
import fs from "fs/promises";

export const app = express();

const schemaPath = path.join(import.meta.dirname, "./schema.graphql");
const schemaFile = await fs.readFile(schemaPath, "utf-8");
let structypeSchema = toStructype(schemaFile);

chokidar.watch(schemaPath, { persistent: true }).on("change", async () => {
  const schemaFile = await fs.readFile(schemaPath, "utf-8");
  structypeSchema = toStructype(schemaFile);
  listeners.forEach((listener) => listener("schema_updated", structypeSchema));
});

type ListenerCallback = (event: "schema_updated", schema: Schema_Index) => void;
const listeners: ListenerCallback[] = [];

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      return {
        virtualAPI: {
          schema: structypeSchema,
          send(message: string) {
            console.log("Message from Dashboard", message);
          },
          listen(callback: ListenerCallback) {
            listeners.push(callback);
            return () => {
              const index = listeners.indexOf(callback);
              if (index !== -1) {
                listeners.splice(index, 1);
              }
            };
          },
        },
      };
    },
  })
);
