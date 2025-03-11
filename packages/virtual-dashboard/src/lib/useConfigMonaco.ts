import { use, useEffect, useState } from "react";
import { MonacoContext } from "~/contexts/Monaco";
import { loadVirtualLibsIntoMonaco } from "./loadVirtualDts";

import type { Schema_Index } from "@kube/structype";
import type { editor } from "monaco-editor";

export function useConfigMonaco(schema: Schema_Index) {
  const monaco = use(MonacoContext);
  const [models, setModels] = useState<editor.IModel[]>([]);

  useEffect(() => {
    if (!monaco) return;

    const model1 = monaco.editor.createModel(
      [
        `export default VirtualState({`,
        `  Query: {`,
        `    hello: () => "Hello!",`,
        `    world: () => 42,`,
        `  }`,
        `})`,
      ].join("\n"),
      "typescript",
      monaco.Uri.parse("inmemory://model/model1.ts")
    );

    const model2 = monaco.editor.createModel(
      [
        `export default VirtualState({`,
        `  Query: {`,
        `    hello: () => "Hello!",`,
        `    world: () => 42,`,
        `  }`,
        `})`,
      ].join("\n"),
      "typescript",
      monaco.Uri.parse("inmemory://model/model2.ts")
    );

    setModels([model1, model2]);

    return () => {
      model1.dispose();
      model2.dispose();
    };
  }, [monaco]);

  useEffect(() => {
    if (!monaco) return;

    // validation settings
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      allowNonTsExtensions: true,
    });

    const fileRootPath = "inmemory://model/";

    loadVirtualLibsIntoMonaco(monaco, fileRootPath, schema);

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      rootDir: fileRootPath,
    });
  }, [monaco, schema]);

  return { models };
}
