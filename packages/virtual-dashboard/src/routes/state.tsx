import type { Schema_Index } from "@kube/structype";
import { use, useState } from "react";
import { Button } from "~/components/ui/button";
import { VirtualContext } from "~/contexts/Virtual";
import { MonacoEditor } from "~/lib/MonacoEditor";
import { useConfigMonaco } from "~/lib/useConfigMonaco";

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

export default function StateView() {
  const { schema } = use(VirtualContext);

  return (
    <div className="h-full w-full flex flex-col">
      <StateEditor schema={schema} />
    </div>
  );
}
