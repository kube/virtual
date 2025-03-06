import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { useEffect } from "react";

async function loadMonaco() {
  const monaco = await import("monaco-editor");

  self.MonacoEnvironment ??= {
    getWorker: function (_, label) {
      switch (label) {
        case "json":
          return new jsonWorker();
        case "css":
        case "scss":
        case "less":
          return new cssWorker();
        case "html":
        case "handlebars":
        case "razor":
          return new htmlWorker();
        case "typescript":
        case "javascript":
          return new tsWorker();
        default:
          return new editorWorker();
      }
    },
  };
  return monaco;
}

export function useMonaco(editorRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const editor = loadMonaco().then((monaco) => {
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
      const libSource = `
      declare function VirtualState<const T extends { a: 42, b: string }>(c: (props: { context: {}, store: {} }) => T): T;
    `;

      const libUri = "ts:filename/facts.d.ts";
      monaco.languages.typescript.typescriptDefaults.setExtraLibs([
        { content: libSource, filePath: libUri },
      ]);
      // When resolving definitions and references, the editor will try to use created models.
      // Creating a model for the library allows "peek definition/references" commands to work with the library.

      if (!monaco.editor.getModel(monaco.Uri.parse(libUri))) {
        monaco.editor.createModel(
          libSource,
          "typescript",
          monaco.Uri.parse(libUri)
        );
      }

      return monaco.editor.create(editorRef.current!, {
        value:
          "export default VirtualState(({ store, context }) => {\n  return {}\n});",
        language: "typescript",
        automaticLayout: true,
      });
    });

    return () => {
      editor.then((_) => _.dispose());
    };
  }, [editorRef]);
}
