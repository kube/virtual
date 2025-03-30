import { toGraphqlSchema } from "@kube/structype-graphql";
import { GraphiQL } from "graphiql";
import "graphiql/graphiql.css";
import { useCallback, useMemo } from "react";
import { useVirtualServer } from "~/contexts/Virtual";

export default function GraphiqlView() {
  const { schema: structypeSchema, virtualServer } = useVirtualServer();

  const schema = useMemo(
    () => toGraphqlSchema(structypeSchema),
    [structypeSchema]
  );

  type Fetcher = React.ComponentProps<typeof GraphiQL>["fetcher"];

  const fetcher = useCallback<Fetcher>(async (props) => {
    return virtualServer.resolve(props.query);
  }, []);

  return (
    <div className="grow">
      <GraphiQL schema={schema} fetcher={fetcher} />
    </div>
  );
}
