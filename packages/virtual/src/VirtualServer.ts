import { makeExecutableSchema } from "@graphql-tools/schema";
import { Schema_Index } from "@kube/structype";
import { toGraphqlSchema } from "@kube/structype-graphql";
import type { NextHandleFunction } from "connect";
import { execute, parse } from "graphql";
import { createDefaultResolvers } from "./createDefaultResolvers.js";

type VIRTUALSERVER_EVENTS_TYPEMAP = {
  schema_updated: Schema_Index;
  query_received: string;
};

export type VirtualServer_Event = {
  [K in keyof VIRTUALSERVER_EVENTS_TYPEMAP]: {
    type: K;
    payload: VIRTUALSERVER_EVENTS_TYPEMAP[K];
  };
}[keyof VIRTUALSERVER_EVENTS_TYPEMAP];

export type VirtualServer_EventListener = (event: VirtualServer_Event) => void;

type Disposer = () => void;

export type VirtualServer = {
  readonly schema: Schema_Index;
  readonly setSchema: (schema: Schema_Index) => void;
  readonly stateFiles: string[];
  readonly addEventListener: (
    callback: VirtualServer_EventListener
  ) => Disposer;
  readonly resolve: (query: string) => Promise<any>;
  readonly createRequestHandler: () => NextHandleFunction;
};

type VirtualServerArgs = {
  schema: Schema_Index;
};

export function createVirtualServer(props: VirtualServerArgs): VirtualServer {
  let schema = props.schema;

  let defaultResolvers = createDefaultResolvers(schema);
  let executableSchema = makeExecutableSchema({
    typeDefs: toGraphqlSchema(schema),
    resolvers: defaultResolvers,
  });

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

  const createRequestHandler: VirtualServer["createRequestHandler"] = () => {
    return async (req, res, next) => {
      if (req.url !== "/_virtual" && !req.url?.startsWith("/_virtual/")) {
        return next();
      }

      if (req.url === "/_virtual/schema") {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(schema));
      }

      if (req.url === "/_virtual/events") {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        const dispose = addEventListener((event) => {
          res.write(`data: ${JSON.stringify(event)}\n`);
        });
        req.on("close", dispose);
      }

      if (req.url === "/_virtual/graphql") {
        const formidable = await import("formidable").then((_) => _.default);
        const form = formidable({});
        form.parse(req, async (_err, fields, _files) => {
          res.setHeader("Content-Type", "application/json");
          const query = fields.query as any as string;
          const result = await resolve(query);
          res.end(JSON.stringify(result));
        });
      }
    };
  };

  return {
    schema,
    setSchema,
    resolve,
    addEventListener,
    createRequestHandler,
  };
}

createVirtualServer.fromHttpServer = async function fromHttpServer(
  url: string
) {
  const schema = await fetch(`${url}_virtual/schema`).then((_) => _.json());
  const virtualServer = createVirtualServer({ schema });
  const eventSource = new EventSource(`${url}_virtual/events`);

  eventSource.onmessage = (_) => {
    const event = JSON.parse(_.data) as VirtualServer_Event;
    if (event.type === "schema_updated") {
      virtualServer.setSchema(event.payload);
    }
  };

  return virtualServer;
};
