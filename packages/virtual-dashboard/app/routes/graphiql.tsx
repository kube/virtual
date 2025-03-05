import { toGraphqlSchema } from "@kube/structype-graphql";
import type { Route } from "./+types/graphiql";

import { GraphiQL } from "graphiql";
import "graphiql/graphiql.css";
import { useEffect, useMemo, useState } from "react";

function useIsInitialRender() {
  const [isInitial, setIsInitial] = useState(true);
  useEffect(() => setIsInitial(false), []);
  return isInitial;
}

export function loader({ context }: Route.LoaderArgs) {
  return {
    schema: context.virtualAPI.schema,
  };
}

export default function GraphiqlView({ loaderData }: Route.ComponentProps) {
  const isInitialRender = useIsInitialRender();

  const schema = useMemo(
    () => toGraphqlSchema(loaderData.schema),
    [loaderData.schema]
  );

  return (
    <div className="grow">
      {!isInitialRender && <GraphiQL schema={schema} fetcher={() => "42"} />}
    </div>
  );
}
