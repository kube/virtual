import type { editor } from "monaco-editor";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MonacoContext } from "~/contexts/Monaco";

export function useProxyCallback<Fn extends (...args: never[]) => unknown>(
  fn: Fn
): Fn;

export function useProxyCallback(fn: Function) {
  const callbackRef = useRef<typeof fn>(fn);
  callbackRef.current = fn;
  return useCallback((...args: any[]) => callbackRef.current(...args), []);
}

type MonacoEditorProps = {
  className?: string;
  model?: editor.IModel;
  onSave: (content: string) => void;
};

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  className,
  model,
  onSave,
}) => {
  const monaco = useContext(MonacoContext);
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>();

  const _onSave = useProxyCallback(onSave);

  useEffect(() => {
    const editor = monaco.editor.create(editorRef.current!, {
      automaticLayout: true,
      language: "typescript",
      theme: "vs-dark",
      padding: { top: 13, bottom: 13 },
      minimap: { enabled: false },
      lineNumbers: "off",
      scrollbar: {
        verticalScrollbarSize: 0,
        verticalSliderSize: 0,
      },
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const currentEditorModel = editor.getModel();
      if (currentEditorModel) _onSave(currentEditorModel.getValue());
    });

    setEditor(editor);

    return () => {
      setEditor(undefined);
      editor.dispose();
    };
  }, [monaco]);

  useEffect(() => {
    editor?.setModel(model ?? null);
  }, [model, editor]);

  return <div ref={editorRef} className={className} />;
};
