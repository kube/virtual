import "@graphiql/react/dist/style.css";
import type { VirtualServerRemote } from "@kube/virtual";
import { createContext, useEffect, useState } from "react";

type VirtualContext = {
  schema: VirtualServerRemote["schema"];
  stateFiles: VirtualServerRemote["stateFiles"];
  currentStateFilePath: string | undefined;
  selectStateFile: (path: string) => void;
  virtualServer: VirtualServerRemote;
};

export const VirtualContext = createContext<VirtualContext>({} as any);

type VirtualServerProviderProps = React.PropsWithChildren<{
  virtualServer: VirtualServerRemote;
}>;

export const VirtualContextProvider: React.FC<VirtualServerProviderProps> = ({
  virtualServer,
  children,
}) => {
  const [schema, setSchema] = useState(virtualServer.schema);
  const [stateFiles, _setStateFiles] = useState(virtualServer.stateFiles);
  const [currentStateFilePath, _setCurrentStateFilePath] = useState(
    virtualServer.currentStateFile?.path
  );

  useEffect(
    () =>
      virtualServer.addEventListener((event) => {
        switch (event.type) {
          case "schema_updated": {
            return setSchema(event.payload);
          }
          case "query_received": {
            return console.log("Query Received", event.payload);
          }
          case "statefile_selected": {
            return _setCurrentStateFilePath(event.payload.path);
          }
        }
      }),
    [virtualServer]
  );

  const selectStateFile = virtualServer.selectStateFile;

  return (
    <VirtualContext.Provider
      value={{
        schema,
        stateFiles,
        virtualServer,
        currentStateFilePath,
        selectStateFile,
      }}
    >
      {children}
    </VirtualContext.Provider>
  );
};
