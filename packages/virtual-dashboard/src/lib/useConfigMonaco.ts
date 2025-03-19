import { use, useEffect, useState } from "react";
import { MonacoContext } from "~/contexts/Monaco";
import { loadVirtualLibsIntoMonaco } from "./loadVirtualDts";

import type { VirtualServerRemote } from "@kube/virtual";
import type { editor } from "monaco-editor";
import { useVirtualServer } from "~/contexts/Virtual";

const FILE_ROOT_PATH = "inmemory://_virtual/";
const STATE_FILES_ROOT_PATH = "inmemory://_virtual/states/";

export function useConfigMonaco(virtualServer: VirtualServerRemote) {
  const { schema } = useVirtualServer();
  const monaco = use(MonacoContext);

  type StateFilesMap = Record<string, editor.ITextModel | undefined>;
  const [stateFilesMap, setStateFilesMap] = useState<StateFilesMap>({});

  function getStateFileUri(stateFile: { path: string }) {
    if (!monaco) throw new Error("Monaco not loaded");
    return monaco.Uri.parse(STATE_FILES_ROOT_PATH + stateFile.path);
  }

  function getStateFileModel(stateFile: { path: string }) {
    if (!monaco) throw new Error("Monaco not loaded");
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
    if (!monaco) throw new Error("Monaco not loaded");

    const uri = getStateFileUri(stateFile);
    const model = monaco.editor.getModel(uri);

    if (model) {
      model.setValue(stateFile.content);
    } else {
      const model = monaco.editor.createModel(
        stateFile.content,
        "typescript",
        uri
      );
      setStateFilesMap((prev) => ({
        ...prev,
        [stateFile.path]: model,
      }));
    }
  }

  // Update TypeScript libs when schema changes
  useEffect(() => {
    if (monaco) loadVirtualLibsIntoMonaco(monaco, FILE_ROOT_PATH, schema);
  }, [monaco, schema]);

  useEffect(() => {
    if (!monaco) return;

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

  return { stateFilesMap };
}
