import { useRef } from "react";
import { useMonaco } from "~/lib/monaco";

export default function StateView() {
  const editorRef = useRef<HTMLDivElement>(null);

  useMonaco(editorRef);

  return (
    <div className="h-full w-full">
      <div className="h-full w-full" ref={editorRef} />
    </div>
  );
}
