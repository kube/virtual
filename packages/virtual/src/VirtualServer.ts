import { makeExecutableSchema } from "@graphql-tools/schema";
import { Schema_Index } from "@kube/structype";
import { toGraphqlSchema } from "@kube/structype-graphql";
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

export type InitialState = {
  schema: Schema_Index;
  stateFiles: VirtualStateFile[];
};

function mergeDeepResolvers(...resolvers: any[]) {
  const merged: any = {};
  for (const resolver of resolvers) {
    for (const key in resolver) {
      if (key in merged) {
        merged[key] = { ...merged[key], ...resolver[key] };
      } else {
        merged[key] = resolver[key];
      }
    }
  }
  return merged;
}

export function createVirtualServer(props: VirtualServerArgs): VirtualServer {
  let schema = props.schema;

  let compiledVirtualState: any;
  let defaultResolvers = createDefaultResolvers(schema);
  let executableSchema = makeExecutableSchema({
    typeDefs: toGraphqlSchema(schema),
    resolvers: mergeDeepResolvers(defaultResolvers, compiledVirtualState),
  });

  let stateFiles: VirtualStateFile[] = [];

  const eventListeners = new Set<VirtualServer_EventListener>();

  function dispatch(event: VirtualServer_Event) {
    for (const listener of eventListeners) {
      listener(event);
    }
  }

  async function compileState(state: VirtualStateFile) {
    const moduleUrl = `data:text/javascript,${encodeURIComponent(`
      function VirtualState(x) { return x; }
      ${state.content}
    `)}`;
    const module = await import(moduleUrl);

    compiledVirtualState = module.default;

    executableSchema = makeExecutableSchema({
      typeDefs: toGraphqlSchema(schema),
      resolvers: mergeDeepResolvers(defaultResolvers, compiledVirtualState),
    });
  }

  const setSchema: VirtualServer["setSchema"] = (newSchema) => {
    schema = newSchema;
    defaultResolvers = createDefaultResolvers(schema);
    executableSchema = makeExecutableSchema({
      typeDefs: toGraphqlSchema(schema),
      resolvers: mergeDeepResolvers(defaultResolvers, compiledVirtualState),
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
    compileState(file);
    dispatch({ type: "statefile_updated", payload: file });
  };

  const deleteStateFile: VirtualServer["deleteStateFile"] = (path) => {
    props.api.deleteStateFile({ path });
  };

  const deletedStateFile: VirtualServer["deletedStateFile"] = (path) => {
    stateFiles = stateFiles.filter((file) => file.path !== path);
    dispatch({ type: "statefile_deleted", payload: { path } });
  };

  return {
    schema,
    setSchema,
    stateFiles,
    resolve,
    addEventListener,
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
  "setSchema" | "createdStateFile" | "updatedStateFile" | "deletedStateFile"
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
