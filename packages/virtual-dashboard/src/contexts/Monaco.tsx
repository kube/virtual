import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

import { createContext, useEffect, useState } from "react";

type Monaco = typeof import("monaco-editor");

const FILE_ROOT_PATH = "inmemory://_virtual/";

export const MonacoContext = createContext<Monaco | null>(null);

export function MonacoProvider({ children }: React.PropsWithChildren) {
  const [monaco, setMonaco] = useState<Monaco>();

  useEffect(() => {
    import("monaco-editor").then((monaco) => {
      setMonaco(monaco);

      // Link language workers
      self.MonacoEnvironment ??= {
        getWorker: function (_, label) {
          switch (label) {
            case "json":
              // Not even sure we need JSON Worker, though
              // its weight is negligible compared TS worker
              return new jsonWorker();
            case "typescript":
            case "javascript":
              return new tsWorker();
            default:
              return new editorWorker();
          }
        },
      };

      // Validation settings
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      // Compiler options
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true,
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        allowSyntheticDefaultImports: true,
        rootDir: FILE_ROOT_PATH,
      });
    });
  });

  if (!monaco) return <div>Loading Monaco...</div>;

  return (
    <MonacoContext.Provider value={monaco}>{children}</MonacoContext.Provider>
  );
}
