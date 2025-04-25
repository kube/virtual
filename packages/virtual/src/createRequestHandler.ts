import { NextHandleFunction } from "connect";
import formidable from "formidable";
import { InitialState, VirtualServer } from "./VirtualServer";

export function createRequestHandler(
  virtualServer: VirtualServer
): NextHandleFunction {
  return async (req, res, next) => {
    if (req.url !== "/_virtual" && !req.url?.startsWith("/_virtual/")) {
      return next();
    }

    const { schema, stateFiles, currentStateFile } = virtualServer;

    switch (req.url) {
      case "/_virtual/initial": {
        res.setHeader("Content-Type", "application/json");
        const initialState: InitialState = {
          schema,
          stateFiles,
          currentStateFile,
        };
        res.end(JSON.stringify(initialState));
        break;
      }
      case "/_virtual/events": {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        const dispose = virtualServer.addEventListener((event) => {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        });
        req.on("close", dispose);
        break;
      }
      case "/_virtual/emit": {
        const form = formidable({});
        form.parse(req, async (_err, fields, _files) => {
          res.setHeader("Content-Type", "application/json");
          const operation = fields.operation as any as string;
          switch (operation) {
            case "statefile_select": {
              const path = fields.path as any as string;
              virtualServer.selectStateFile(path);
              break;
            }
            case "statefile_create": {
              const path = fields.path as any as string;
              const content = fields.content as any as string;
              virtualServer.createStateFile({ path, content });
              break;
            }
            case "statefile_update": {
              const path = fields.path as any as string;
              const content = fields.content as any as string;
              virtualServer.updateStateFile({ path, content });
              break;
            }
            case "statefile_delete": {
              const path = fields.path as any as string;
              virtualServer.deleteStateFile(path);
              break;
            }
            case "statefile_option_update": {
              const path = fields.path as any as string;
              const optionName = fields.optionName as any as string;
              const value = fields.value as any as string;
              virtualServer.updateStateFileOption(path, optionName, value);
              break;
            }
          }
          res.end("Done");
        });
        break;
      }
      case "/_virtual/graphql": {
        const form = formidable({});
        form.parse(req, async (_err, fields, _files) => {
          res.setHeader("Content-Type", "application/json");
          const query = fields.query as any as string;
          const result = await virtualServer.resolve(query);
          res.end(JSON.stringify(result));
        });
        break;
      }
    }
  };
}
