import { createContext, useEffect, useState } from "react";

type Monaco = typeof import("monaco-editor");

const FILE_ROOT_PATH = "inmemory://_virtual/";

export const MonacoContext = createContext<Monaco>({} as any);

export function MonacoProvider({ children }: React.PropsWithChildren) {
  const [monaco, setMonaco] = useState<Monaco>();

  useEffect(() => {
    import("monaco-editor").then((monaco) => {
      // Link language workers
      self.MonacoEnvironment ??= {
        async getWorker(_, label) {
          switch (label) {
            case "json": {
              const JsonWorker = await import(
                "monaco-editor/esm/vs/language/json/json.worker?worker"
              );
              return new JsonWorker.default();
            }

            case "typescript":
            case "javascript": {
              const TsWorker = await import(
                "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
              );
              return new TsWorker.default();
            }

            default: {
              const EditorWorker = await import(
                "monaco-editor/esm/vs/editor/editor.worker?worker"
              );
              return new EditorWorker.default();
            }
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

      setMonaco(monaco);
    });
  });

  if (!monaco) return <div>Loading Monaco...</div>;

  return (
    <MonacoContext.Provider value={monaco}>{children}</MonacoContext.Provider>
  );
}
