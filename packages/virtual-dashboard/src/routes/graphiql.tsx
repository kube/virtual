import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { toGraphqlSchema } from "@kube/structype-graphql";
import { GraphiQL } from "graphiql";
import "graphiql/graphiql.css";
import { useCallback, useMemo } from "react";
import { useVirtualServer } from "~/contexts/Virtual";

export default function GraphiqlView() {
  const { schema: structypeSchema } = useVirtualServer();

  const schema = useMemo(
    () => toGraphqlSchema(structypeSchema),
    [structypeSchema]
  );

  const fetcher = useCallback(
    createGraphiQLFetcher({ url: "/_virtual/graphql" }),
    []
  );

  return (
    <div className="grow">
      <GraphiQL schema={schema} fetcher={fetcher} />
    </div>
  );
}
