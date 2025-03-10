import { eventStream } from "remix-utils/sse/server";
import type { Route } from "./+types/api";

export function loader({ request, context }: Route.LoaderArgs) {
  return eventStream(request.signal, function setup(send) {
    return context.virtualAPI.listen((event, schema) => {
      if (event === "schema_updated") {
        send({ event: "schema_update", data: JSON.stringify(schema) });
      } else {
        console.log("Unknown event", event);
      }
    });
  });
}
