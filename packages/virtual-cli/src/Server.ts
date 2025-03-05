import { createRequestListener } from "@react-router/node";
import fs from "node:fs/promises";
import { type RequestListener } from "node:http";
import path from "node:path";

import { Schema_Index } from "@kube/structype";
import * as build from "@kube/virtual-dashboard/server";

type Options = {
  schema: Schema_Index;
};

export function createVirtualInstance({ schema }: Options): RequestListener {
  return async (req, res) => {
    if (!req.url) {
      return res.end("Not found");
    }

    // TODO: GraphQL API/Resolver here
    // ...

    // Dashboard
    const loadContext: build.LoadContext = {
      virtualAPI: {
        schema,
        callback: (message) => console.log("Message from Dashboard", message),
      },
    };

    const handler = createRequestListener({
      build,
      getLoadContext: () => loadContext,
    });

    if (req.url.startsWith("/assets/")) {
      // Put correct header
      if (req.url.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (req.url.endsWith(".js")) {
        res.setHeader("Content-Type", "text/javascript");
      }
      return res.end(
        await fs.readFile(
          path.join(build.entry.module.ASSETS_PATH, req.url),
          "utf-8"
        )
      );
    }

    return handler(req, res);
  };
}
