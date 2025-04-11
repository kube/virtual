import {
  EditorContextProvider as GraphiqlEditorContextProvider,
  SchemaContextProvider as GraphiqlSchemaContextProvider,
} from "@graphiql/react";
import { createContext, use, useEffect, useMemo, useState } from "react";
import { MonacoContext } from "~/contexts/Monaco";
import { loadVirtualLibsIntoMonaco } from "../lib/loadVirtualLibsIntoMonaco";

import { toGraphqlSchema } from "@kube/structype-graphql";
import type { VirtualServerRemote } from "@kube/virtual";
import type { editor } from "monaco-editor";
import { VirtualContext } from "~/contexts/Virtual";

const FILE_ROOT_PATH = "inmemory://_virtual/";
const STATE_FILES_ROOT_PATH = "inmemory://_virtual/states/";

type StateFilesMap = Record<
  string,
  | {
      isDirty: boolean;
      stateFile: VirtualServerRemote["stateFiles"][number];
      model: editor.ITextModel;
    }
  | undefined
>;

export const VirtualDashboardContext = createContext<{
  virtualServer: VirtualServerRemote;
  stateFilesMap: StateFilesMap;
  currentStateFile: StateFilesMap[string];
  selectStateFile: VirtualServerRemote["selectStateFile"];
}>({} as any);

export const VirtualDashboardContextProvider: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  const { virtualServer, schema, currentStateFilePath, selectStateFile } =
    use(VirtualContext);

  const monaco = use(MonacoContext);

  const [stateFilesMap, setStateFilesMap] = useState<StateFilesMap>({});
  const currentStateFile = currentStateFilePath
    ? stateFilesMap[currentStateFilePath]
    : undefined;

  function getStateFileUri(stateFile: { path: string }) {
    return monaco.Uri.parse(STATE_FILES_ROOT_PATH + stateFile.path);
  }

  function getStateFileModel(stateFile: { path: string }) {
    const uri = getStateFileUri(stateFile);
    return monaco.editor.getModel(uri);
  }

  function disposeModel(stateFile: { path: string }) {
    setStateFilesMap((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([uri]) => uri !== stateFile.path)
      )
    );
    getStateFileModel(stateFile)?.dispose();
  }

  function createOrUpdateModel(stateFile: { path: string; content: string }) {
    const uri = getStateFileUri(stateFile);
    const model = monaco.editor.getModel(uri);

    if (model) {
      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: stateFile.content }],
        () => null
      );
      setStateFilesMap((prev) => ({
        ...prev,
        [stateFile.path]: { isDirty: false, stateFile, model },
      }));
    } else {
      const model = monaco.editor.createModel(
        stateFile.content,
        "typescript",
        uri
      );
      model.onDidChangeContent(() => {
        setStateFilesMap((prev) => {
          const currentStateFile = prev[stateFile.path]!;

          return {
            ...prev,
            [stateFile.path]: {
              isDirty: model.getValue() !== currentStateFile.stateFile.content,
              stateFile: currentStateFile.stateFile,
              model,
            },
          };
        });
      });
      setStateFilesMap((prev) => ({
        ...prev,
        [stateFile.path]: { isDirty: false, stateFile, model },
      }));
    }
  }

  // Update TypeScript libs when schema changes
  useEffect(() => {
    loadVirtualLibsIntoMonaco(monaco, FILE_ROOT_PATH, schema);
  }, [monaco, schema]);

  useEffect(() => {
    // Create model for initial state files
    virtualServer.stateFiles.forEach(createOrUpdateModel);

    // Watch for schema/state file changes and update models/libs
    const disposeWatcher = virtualServer.addEventListener((event) => {
      switch (event.type) {
        case "statefile_updated":
        case "statefile_created": {
          createOrUpdateModel(event.payload);
          break;
        }
        case "statefile_deleted": {
          disposeModel(event.payload);
          break;
        }
      }
    });

    // Dispose watcher and models on unmount
    return () => {
      disposeWatcher();
      virtualServer.stateFiles.forEach(disposeModel);
    };
  }, [monaco, virtualServer]);

  const graphqlSchema = useMemo(() => toGraphqlSchema(schema), [schema]);
  const defaultQuery = `query {}`;

  return (
    <VirtualDashboardContext.Provider
      value={{
        virtualServer,
        stateFilesMap,
        currentStateFile,
        selectStateFile,
      }}
    >
      <GraphiqlEditorContextProvider query={defaultQuery}>
        <GraphiqlSchemaContextProvider
          schema={graphqlSchema}
          fetcher={({ query }) => virtualServer.resolve(query)}
        >
          {children}
        </GraphiqlSchemaContextProvider>
      </GraphiqlEditorContextProvider>
    </VirtualDashboardContext.Provider>
  );
};
