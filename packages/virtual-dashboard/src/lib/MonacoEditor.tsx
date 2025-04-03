import type { editor } from "monaco-editor";
import { useContext, useEffect, useRef, useState } from "react";
import { MonacoContext } from "~/contexts/Monaco";
import { useProxyCallback } from "./hooks";

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
      theme: "vs-dark",
      padding: { top: 12, bottom: 12 },
      minimap: { enabled: false },
      lineNumbers: "off",
      fontFamily: "DM Mono",
      fontSize: 13,
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
