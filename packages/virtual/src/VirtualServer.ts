import { makeExecutableSchema } from "@graphql-tools/schema";
import { Schema_Index } from "@kube/structype";
import { toGraphqlSchema } from "@kube/structype-graphql";
import type { NextHandleFunction } from "connect";
import { execute, parse } from "graphql";
import { createDefaultResolvers } from "./createDefaultResolvers.js";

type VIRTUALSERVER_EVENTS_TYPEMAP = {
  schema_updated: Schema_Index;
  query_received: string;
  statefile_created: { path: string; content: string };
  statefile_updated: { path: string; content: string };
  statefile_deleted: { path: string };
};

export type VirtualServer_Event = {
  [K in keyof VIRTUALSERVER_EVENTS_TYPEMAP]: {
    type: K;
    payload: VIRTUALSERVER_EVENTS_TYPEMAP[K];
  };
}[keyof VIRTUALSERVER_EVENTS_TYPEMAP];

export type VirtualServer_EventListener = (event: VirtualServer_Event) => void;

type Disposer = () => void;

type VirtualStateFile = {
  readonly path: string;
  readonly content: string;
};

export type VirtualServer = {
  readonly schema: Schema_Index;
  readonly setSchema: (schema: Schema_Index) => void;
  readonly stateFiles: VirtualStateFile[];
  readonly addEventListener: (
    callback: VirtualServer_EventListener
  ) => Disposer;
  readonly resolve: (query: string) => Promise<any>;
  readonly createRequestHandler: () => NextHandleFunction;
  readonly createStateFile: (file: VirtualStateFile) => void;
  readonly createdStateFile: (file: VirtualStateFile) => void;
  readonly updateStateFile: (file: VirtualStateFile) => void;
  readonly updatedStateFile: (file: VirtualStateFile) => void;
  readonly deleteStateFile: (path: string) => void;
  readonly deletedStateFile: (path: string) => void;
};

type VirtualServerArgs = {
  schema: Schema_Index;
  api: {
    createStateFile: (file: VirtualStateFile) => Promise<void>;
    updateStateFile: (file: VirtualStateFile) => Promise<void>;
    deleteStateFile: (file: Pick<VirtualStateFile, "path">) => Promise<void>;
  };
};

type InitialState = {
  schema: Schema_Index;
  stateFiles: VirtualStateFile[];
};

export function createVirtualServer(props: VirtualServerArgs): VirtualServer {
  let schema = props.schema;

  let defaultResolvers = createDefaultResolvers(schema);
  let executableSchema = makeExecutableSchema({
    typeDefs: toGraphqlSchema(schema),
    resolvers: defaultResolvers,
  });

  let stateFiles: VirtualStateFile[] = [];

  const eventListeners = new Set<VirtualServer_EventListener>();

  function dispatch(event: VirtualServer_Event) {
    for (const listener of eventListeners) {
      listener(event);
    }
  }

  const setSchema: VirtualServer["setSchema"] = (newSchema) => {
    schema = newSchema;
    defaultResolvers = createDefaultResolvers(schema);
    executableSchema = makeExecutableSchema({
      typeDefs: toGraphqlSchema(schema),
      resolvers: defaultResolvers,
    });
    dispatch({ type: "schema_updated", payload: schema });
  };

  const resolve: VirtualServer["resolve"] = async (query) => {
    const queryDoc = parse(query);
    return execute({
      schema: executableSchema,
      document: queryDoc,
      variableValues: {},
      contextValue: { hello: "world" },
    });
  };

  const addEventListener: VirtualServer["addEventListener"] = (callback) => {
    eventListeners.add(callback);
    return () => {
      eventListeners.delete(callback);
    };
  };

  const createStateFile: VirtualServer["createStateFile"] = (file) => {
    props.api.createStateFile(file);
  };

  const createdStateFile: VirtualServer["createdStateFile"] = (file) => {
    stateFiles.push(file);
    dispatch({ type: "statefile_created", payload: file });
  };

  const updateStateFile: VirtualServer["updateStateFile"] = (file) => {
    props.api.updateStateFile(file);
  };

  const updatedStateFile: VirtualServer["updatedStateFile"] = (file) => {
    const index = stateFiles.findIndex((f) => f.path === file.path);
    if (index === -1) {
      throw new Error(`File not found: ${file.path}`);
    }
    stateFiles[index] = file;
    dispatch({ type: "statefile_updated", payload: file });
  };

  const deleteStateFile: VirtualServer["deleteStateFile"] = (path) => {
    props.api.deleteStateFile({ path });
  };

  const deletedStateFile: VirtualServer["deletedStateFile"] = (path) => {
    stateFiles = stateFiles.filter((file) => file.path !== path);
    dispatch({ type: "statefile_deleted", payload: { path } });
  };

  const createRequestHandler: VirtualServer["createRequestHandler"] = () => {
    const formidablePromise = import("formidable").then((_) => _.default);

    return async (req, res, next) => {
      const formidable = await formidablePromise;

      if (req.url !== "/_virtual" && !req.url?.startsWith("/_virtual/")) {
        return next();
      }

      switch (req.url) {
        case "/_virtual/initial": {
          res.setHeader("Content-Type", "application/json");
          const initialState: InitialState = {
            schema,
            stateFiles,
          };
          res.end(JSON.stringify(initialState));
          break;
        }
        case "/_virtual/events": {
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");
          const dispose = addEventListener((event) => {
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

            console.log("EMIT:API", operation, fields);
            switch (operation) {
              case "statefile_create": {
                console.log("EMIT:API CREATE STATE FILE", fields);
                const path = fields.path as any as string;
                const content = fields.content as any as string;
                createStateFile({ path, content });
                break;
              }
              case "statefile_update": {
                const path = fields.path as any as string;
                const content = fields.content as any as string;
                updateStateFile({ path, content });
                break;
              }
              case "statefile_delete": {
                const path = fields.path as any as string;
                deleteStateFile(path);
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
            const result = await resolve(query);
            res.end(JSON.stringify(result));
          });
          break;
        }
      }
    };
  };

  return {
    schema,
    setSchema,
    stateFiles,
    resolve,
    addEventListener,
    createRequestHandler,
    createStateFile,
    createdStateFile,
    updateStateFile,
    updatedStateFile,
    deleteStateFile,
    deletedStateFile,
  };
}

export type VirtualServerRemote = Omit<
  VirtualServer,
  | "setSchema"
  | "createRequestHandler"
  | "createdStateFile"
  | "updatedStateFile"
  | "deletedStateFile"
>;

createVirtualServer.fromHttpServer = async function fromHttpServer(
  url: string
): Promise<VirtualServerRemote> {
  let { schema, stateFiles } = (await fetch(`${url}_virtual/initial`).then(
    (_) => _.json()
  )) as InitialState;
  const eventSource = new EventSource(`${url}_virtual/events`);

  eventSource.addEventListener("message", (_) => {
    const event = JSON.parse(_.data) as VirtualServer_Event;
    switch (event.type) {
      case "schema_updated": {
        schema = event.payload;
        break;
      }
      case "statefile_created": {
        stateFiles.push(event.payload);
        break;
      }
      case "statefile_updated": {
        const index = stateFiles.findIndex(
          (file) => file.path === event.payload.path
        );
        if (index !== -1) stateFiles[index] = event.payload;
        break;
      }
      case "statefile_deleted":
        stateFiles = stateFiles.filter(
          (file) => file.path !== event.payload.path
        );
        break;
    }
  });

  const addEventListener: VirtualServer["addEventListener"] = (callback) => {
    function listener(event: MessageEvent<string>) {
      const data = JSON.parse(event.data) as VirtualServer_Event;
      callback(data);
    }
    eventSource.addEventListener("message", listener);
    return () => eventSource.removeEventListener("message", listener);
  };

  const createStateFile: VirtualServer["createdStateFile"] = async (file) => {
    console.log("API CREATE STATE FILE", file);
    await fetch(`${url}_virtual/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "statefile_create",
        path: file.path,
        content: file.content,
      }),
    });
  };

  const updateStateFile: VirtualServer["updatedStateFile"] = async (file) => {
    await fetch(`${url}_virtual/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "statefile_update",
        path: file.path,
        content: file.content,
      }),
    });
  };

  const deleteStateFile: VirtualServer["deletedStateFile"] = async (path) => {
    await fetch(`${url}_virtual/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "statefile_delete",
        path,
      }),
    });
  };

  const resolve: VirtualServer["resolve"] = async (query) => {
    const response = await fetch(`${url}_virtual/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    return response.json();
  };

  return {
    schema,
    stateFiles,
    resolve,
    addEventListener,
    createStateFile,
    updateStateFile,
    deleteStateFile,
  };
};
