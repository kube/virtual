import { Switch } from "@radix-ui/react-switch";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/schema";

export function loader({ context }: Route.LoaderArgs) {
  return { context };
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const message = formData.get("message");

  if (typeof message === "string") {
    context.virtualAPI.callback(message);
  }
}

export default function SchemaView({ loaderData }: Route.ComponentProps) {
  const { context } = loaderData;

  const fetcher = useFetcher();

  return (
    <div>
      <h1>Schema</h1>
      <fetcher.Form method="POST">
        <Input name="message" type="text" />
        <Button type="submit">Callback</Button>
      </fetcher.Form>

      <Switch />
      <pre>{JSON.stringify(context, null, 2)}</pre>
    </div>
  );
}
