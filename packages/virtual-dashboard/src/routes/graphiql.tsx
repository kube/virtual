import { toGraphqlSchema } from "@kube/structype-graphql";
import type { editor } from "monaco-editor";
import { use, useEffect, useMemo, useState } from "react";
import { MonacoContext } from "~/contexts/Monaco";
import { useVirtualServer } from "~/contexts/Virtual";
import { MonacoEditor } from "~/lib/MonacoEditor";

function useGraphqlQueryMonacoModel() {
  const monaco = use(MonacoContext);
  const [model, setModel] = useState<editor.ITextModel>();

  useEffect(() => {
    const modelUri = monaco.Uri.parse("inmemory://graphql/model.graphql");
    const existingModel = monaco.editor.getModel(modelUri);
    const model =
      existingModel ??
      monaco.editor.createModel("query {\n\n}", "typescript", modelUri);

    setModel(model);
    return () => model.dispose();
  }, [monaco]);

  return model;
}

export default function GraphiqlView() {
  const { schema: structypeSchema, virtualServer } = useVirtualServer();

  const schema = useMemo(
    () => toGraphqlSchema(structypeSchema),
    [structypeSchema]
  );

  const model = useGraphqlQueryMonacoModel();

  return (
    <div className="grow h-full">
      <MonacoEditor
        className="h-full w-full"
        model={model}
        onSave={async (query) =>
          console.log(await virtualServer.resolve(query))
        }
      />
    </div>
  );
}
