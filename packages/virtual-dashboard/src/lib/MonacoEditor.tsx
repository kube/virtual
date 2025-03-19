import type { editor } from "monaco-editor";
import { useContext, useEffect, useRef, useState } from "react";
import { MonacoContext } from "~/contexts/Monaco";

type MonacoEditorProps = {
  className?: string;
  model?: editor.IModel;
  onSave: () => void;
};

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  className,
  model,
  onSave,
}) => {
  const monaco = useContext(MonacoContext);
  const editorRef = useRef<HTMLDivElement>(null);

  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>();

  useEffect(() => {
    if (!monaco) return;

    const editor = monaco.editor.create(editorRef.current!, {
      language: "typescript",
      automaticLayout: true,
      theme: "vs-dark",
      padding: { top: 13, bottom: 13 },
      minimap: { enabled: false },
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, onSave);

    setEditor(editor);

    return () => {
      setEditor(undefined);
      editor.dispose();
    };
  }, [monaco]);

  useEffect(() => {
    editor?.setModel(model ?? null);
  }, [model, editor]);

  if (!monaco) {
    return <div className={className} />;
  }

  return <div ref={editorRef} className={className} />;
};
