import {
  EditorContextProvider,
  SchemaContextProvider as GraphqlSchemaContextProvider,
} from "@graphiql/react";
import "@graphiql/react/dist/style.css";
import { toGraphqlSchema } from "@kube/structype-graphql";
import type { VirtualServerRemote } from "@kube/virtual";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

  const graphqlSchema = useMemo(() => toGraphqlSchema(schema), [schema]);

  const defaultQuery = `query {
  hello
}`;

  return (
    <VirtualContext.Provider value={{ schema, stateFiles, virtualServer }}>
      <EditorContextProvider query={defaultQuery}>
        <GraphqlSchemaContextProvider
          schema={graphqlSchema}
          fetcher={({ query }) => virtualServer.resolve(query)}
        >
          {children}
        </GraphqlSchemaContextProvider>
      </EditorContextProvider>
    </VirtualContext.Provider>
  );
};

export function useVirtualServer() {
  return useContext(VirtualContext);
}
