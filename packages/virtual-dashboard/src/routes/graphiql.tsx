import { toGraphqlSchema } from "@kube/structype-graphql";
import { GraphiQL } from "graphiql";
import "graphiql/graphiql.css";
import { use, useMemo } from "react";
import { VirtualContext } from "~/contexts/Virtual";

export default function GraphiqlView() {
  const { schema: structypeSchema } = use(VirtualContext);

  const schema = useMemo(
    () => toGraphqlSchema(structypeSchema),
    [structypeSchema]
  );

  return (
    <div className="grow">
      <GraphiQL schema={schema} fetcher={() => "42"} />
    </div>
  );
}
