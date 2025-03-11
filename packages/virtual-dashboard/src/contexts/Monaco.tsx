import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

import { createContext, useEffect, useState } from "react";

type Monaco = typeof import("monaco-editor");

export const MonacoContext = createContext<Monaco | null>(null);

export function MonacoProvider({ children }: React.PropsWithChildren) {
  const [monaco, setMonaco] = useState<Monaco>();

  useEffect(() => {
    import("monaco-editor").then((monaco) => {
      setMonaco(monaco);
      self.MonacoEnvironment ??= {
        getWorker: function (_, label) {
          switch (label) {
            case "json":
              return new jsonWorker();
            case "typescript":
            case "javascript":
              return new tsWorker();
            default:
              return new editorWorker();
          }
        },
      };
    });
  });

  return (
    <MonacoContext.Provider value={monaco ?? null}>
      {children}
    </MonacoContext.Provider>
  );
}
