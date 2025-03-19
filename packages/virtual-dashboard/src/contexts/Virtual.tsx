import type { VirtualServerRemote } from "@kube/virtual";
import { createContext, useContext, useEffect, useState } from "react";

type VirtualServerContext = {
  schema: VirtualServerRemote["schema"];
  stateFiles: VirtualServerRemote["stateFiles"];
  virtualServer: VirtualServerRemote;
};

const VirtualContext = createContext<VirtualServerContext>({} as any);

type VirtualServerProviderProps = React.PropsWithChildren<{
  virtualServer: VirtualServerRemote;
}>;

export const VirtualServerProvider: React.FC<VirtualServerProviderProps> = ({
  virtualServer,
  children,
}) => {
  const [schema, setSchema] = useState(virtualServer.schema);
  const [stateFiles, _setStateFiles] = useState(virtualServer.stateFiles);

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
        }
      }),
    [virtualServer]
  );

  return (
    <VirtualContext.Provider value={{ schema, stateFiles, virtualServer }}>
      {children}
    </VirtualContext.Provider>
  );
};

export function useVirtualServer() {
  return useContext(VirtualContext);
}
