import type { Schema_Index } from "@kube/structype";
import type { VirtualServer } from "@kube/virtual";
import { createContext, useContext, useEffect, useState } from "react";

type VirtualServerContext = {
  schema: Schema_Index;
  virtualServer: VirtualServer;
};

const VirtualContext = createContext<VirtualServerContext>({} as any);

type VirtualServerProviderProps = React.PropsWithChildren<{
  virtualServer: VirtualServer;
}>;

export const VirtualServerProvider: React.FC<VirtualServerProviderProps> = ({
  virtualServer,
  children,
}) => {
  const [schema, setSchema] = useState(virtualServer.schema);

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
    <VirtualContext.Provider value={{ schema, virtualServer }}>
      {children}
    </VirtualContext.Provider>
  );
};

export function useVirtualServer() {
  return useContext(VirtualContext);
}
