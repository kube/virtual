import type { Schema_Index } from "@kube/structype";
import { useState } from "react";
import { useEventSource } from "remix-utils/sse/react";
import { Button } from "~/components/ui/button";
import { MonacoProvider } from "~/contexts/Monaco";
import { MonacoEditor } from "~/lib/MonacoEditor";
import { useConfigMonaco } from "~/lib/useConfigMonaco";
import type { Route } from "./+types/state";

export function loader({ context }: Route.LoaderArgs) {
  return context.virtualAPI;
}

type StateEditorProps = {
  schema: Schema_Index;
};

function StateEditor({ schema }: StateEditorProps) {
  const { models } = useConfigMonaco(schema);

  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const currentModel = models[currentModelIndex];

  return (
    <>
      <div className="grow-0 shrink-0 p-1 flex gap-1 bg-black">
        {models.map((model, index) => (
          <Button
            className="pr-2"
            key={model.uri.toString()}
            onClick={() => setCurrentModelIndex(index)}
          >
            {model.uri.toString().replace("inmemory://model/", "")}
            {currentModelIndex === index && (
              <div className="w-4 flex justify-center">
                <div className="rounded-4xl w-2 h-2 bg-slate-400" />
              </div>
            )}
          </Button>
        ))}
      </div>
      <div className="w-full grow">
        <MonacoEditor className="h-full w-full" model={currentModel} />
      </div>
    </>
  );
}

export default function StateView({ loaderData }: Route.ComponentProps) {
  const schemaRaw = useEventSource("/api", { event: "schema_update" });

  const schema = schemaRaw ? JSON.parse(schemaRaw) : loaderData.schema;

  return (
    <div className="h-full w-full flex flex-col">
      <MonacoProvider>
        <StateEditor schema={schema} />
      </MonacoProvider>
    </div>
  );
}
