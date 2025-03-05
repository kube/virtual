import { createRequestHandler } from "@react-router/express";
import express from "express";
import "react-router";

export const app = express();

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      return {
        virtualAPI: {
          schema: {
            _structype: "index",
            types: {
              Query: {
                _structype: "record",
                name: "Query",
                fields: [
                  {
                    name: "hello",
                    type: {
                      _structype: "number",
                      int: true,
                    },
                  },
                ],
              },
            },
            description: "Virtual API",
          },
          callback: (message: string) =>
            console.log("Message from Dashboard", message),
        },
      };
    },
  })
);
