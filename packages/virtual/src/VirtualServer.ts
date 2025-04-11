import { makeExecutableSchema } from "@graphql-tools/schema";
import { Schema_Index } from "@kube/structype";
import { toGraphqlSchema } from "@kube/structype-graphql";
import { execute, parse } from "graphql";
import { createDefaultResolvers } from "./createDefaultResolvers.js";
import { VirtualState } from "./VirtualState.js";

type VirtualStateFile = {
  readonly path: string;
  readonly content: string;
  options?: VirtualState["options"];
  compilationError?: boolean;
};

type VIRTUALSERVER_EVENTS_TYPEMAP = {
  schema_updated: Schema_Index;
  query_received: string;
  statefile_selected: VirtualStateFile;
  statefile_created: VirtualStateFile;
  statefile_updated: VirtualStateFile;
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

export type VirtualServer = {
  readonly schema: Schema_Index;
  readonly setSchema: (schema: Schema_Index) => void;
  readonly stateFiles: VirtualStateFile[];
  readonly currentStateFile: VirtualStateFile | undefined;
  readonly addEventListener: (
    callback: VirtualServer_EventListener
  ) => Disposer;
  readonly resolve: (query: string) => Promise<any>;
  readonly selectStateFile: (path: string) => void;
  readonly createStateFile: (file: VirtualStateFile) => void;
  readonly createdStateFile: (file: VirtualStateFile) => void;
  readonly updateStateFile: (file: VirtualStateFile) => void;
  readonly updatedStateFile: (file: VirtualStateFile) => void;
  readonly deleteStateFile: (path: string) => void;
  readonly deletedStateFile: (path: string) => void;
};

type VirtualServerArgs = {
  schema: Schema_Index;
  initialStateFiles: VirtualStateFile[];
  api: {
    createStateFile: (file: VirtualStateFile) => Promise<void>;
    updateStateFile: (file: VirtualStateFile) => Promise<void>;
    deleteStateFile: (file: Pick<VirtualStateFile, "path">) => Promise<void>;
  };
};

export type InitialState = {
  schema: Schema_Index;
  stateFiles: VirtualStateFile[];
  currentStateFile: VirtualStateFile | undefined;
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

// THIS SHOULD BE REWRITTEN IN A FULL EVENT-DRIVEN WAY
// POSSIBLY USING RXJS
// FOR NOW EVERYTHING IS A MESS, JUST TO GET IT WORKING
// AND WE CAN REFACTOR LATER
// THE REFACTORING WOULD OF COURSE CHANGE THE API TOO
export function createVirtualServer(props: VirtualServerArgs): VirtualServer {
  let schema = props.schema;

  let stateFiles: VirtualStateFile[] = props.initialStateFiles;

  let currentStateFile = stateFiles[0];
  let compiledVirtualState = { resolvers: {}, options: {} };

  if (currentStateFile) compileState(currentStateFile);

  let defaultResolvers = createDefaultResolvers(schema);
  let executableSchema = makeExecutableSchema({
    typeDefs: toGraphqlSchema(schema),
    resolvers: mergeDeepResolvers(
      defaultResolvers,
      compiledVirtualState.resolvers
    ),
  });

  const eventListeners = new Set<VirtualServer_EventListener>();

  function dispatch(event: VirtualServer_Event) {
    for (const listener of eventListeners) {
      listener(event);
    }
  }

  async function compileVirtualState(state: VirtualStateFile) {
    const moduleUrl = `data:text/javascript,${encodeURIComponent(`
      function VirtualState(x) { return x; }
      ${state.content}
    `)}`;
    const module = await import(/* @vite-ignore */ moduleUrl);
    return module.default;
  }

  // TODO: RENAME THIS, OR MAKE IT REALLY EVENT-DRIVEN
  async function compileState(state: VirtualStateFile) {
    try {
      compiledVirtualState = await compileVirtualState(state);
      state.options = compiledVirtualState.options;
      state.compilationError = false;
      executableSchema = makeExecutableSchema({
        typeDefs: toGraphqlSchema(schema),
        resolvers: mergeDeepResolvers(
          defaultResolvers,
          compiledVirtualState.resolvers
        ),
      });
    } catch {
      // Fallback on default resolvers
      state.compilationError = true;
      executableSchema = makeExecutableSchema({
        typeDefs: toGraphqlSchema(schema),
        resolvers: defaultResolvers,
      });
    }
  }

  const setSchema: VirtualServer["setSchema"] = (newSchema) => {
    schema = newSchema;
    defaultResolvers = createDefaultResolvers(schema);
    executableSchema = makeExecutableSchema({
      typeDefs: toGraphqlSchema(schema),
      resolvers: mergeDeepResolvers(
        defaultResolvers,
        compiledVirtualState.resolvers
      ),
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

  const selectStateFile: VirtualServer["selectStateFile"] = (path) => {
    const file = stateFiles.find((file) => file.path === path);
    if (file) {
      currentStateFile = file;
      compileState(file);
      dispatch({ type: "statefile_selected", payload: file });
    }
  };

  const createStateFile: VirtualServer["createStateFile"] = (file) => {
    props.api.createStateFile(file);
  };

  async function createOrUpdateStateFile(file: VirtualStateFile) {
    const index = stateFiles.findIndex((f) => f.path === file.path);
    if (index !== -1) {
      stateFiles[index] = file;
    } else {
      stateFiles.push(file);
    }
    await compileState(file);
  }

  const createdStateFile: VirtualServer["createdStateFile"] = async (file) => {
    await createOrUpdateStateFile(file);
    dispatch({ type: "statefile_created", payload: file });
  };

  const updateStateFile: VirtualServer["updateStateFile"] = (file) => {
    props.api.updateStateFile(file);
  };

  const updatedStateFile: VirtualServer["updatedStateFile"] = async (file) => {
    await createOrUpdateStateFile(file);
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
    get schema() {
      return schema;
    },
    setSchema,
    get stateFiles() {
      return stateFiles;
    },
    resolve,
    addEventListener,
    selectStateFile,
    get currentStateFile() {
      return currentStateFile;
    },
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
  function fetchInitialState(): Promise<InitialState> {
    return fetch(`${url}_virtual/initial`).then((_) => _.json());
  }

  let { schema, stateFiles, currentStateFile } = await fetchInitialState();

  const eventSource = new EventSource(`${url}_virtual/events`);

  eventSource.addEventListener("message", (_) => {
    const event = JSON.parse(_.data) as VirtualServer_Event;
    switch (event.type) {
      case "schema_updated": {
        schema = event.payload;
        break;
      }
      case "statefile_selected": {
        currentStateFile = event.payload;
        break;
      }
      case "statefile_created":
      case "statefile_updated": {
        const existingFileIndex = stateFiles.findIndex(
          (file) => file.path === event.payload.path
        );
        if (existingFileIndex !== -1) {
          stateFiles[existingFileIndex] = event.payload;
        } else {
          stateFiles.push(event.payload);
        }
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

  const selectStateFile: VirtualServer["selectStateFile"] = (path) => {
    fetch(`${url}_virtual/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "statefile_select",
        path,
      }),
    });
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
    get schema() {
      return schema;
    },
    get stateFiles() {
      return stateFiles;
    },
    get currentStateFile() {
      return currentStateFile;
    },
    selectStateFile,
    resolve,
    addEventListener,
    createStateFile,
    updateStateFile,
    deleteStateFile,
  };
};
