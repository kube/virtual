import { QueryEditor } from "@graphiql/react";
import { use, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { VirtualDashboardContext } from "~/contexts/VirtualDashboard";

const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

export default function GraphiqlView() {
  const { virtualServer } = use(VirtualDashboardContext);
  const query = useRef("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<any>(null);

  return (
    <div
      ref={wrapperRef}
      style={{
        "--editor-background": "#1e1e1e",
        "--font-size-body": "13px",
        "--font-family-mono": "DM Mono",
      }}
      onKeyDown={async (e) => {
        const isModifierKeyPressed = isMac ? e.metaKey : e.ctrlKey;
        if (isModifierKeyPressed && e.key === "Enter") {
          e.preventDefault();
          const result = await virtualServer.resolve(query.current);
          setResult(result);
        }
      }}
      className="grow h-full graphiql-container text-xs bg-[#1e1e1e] py-2 flex flex-col"
    >
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel>
          <QueryEditor onEdit={(q) => (query.current = q)} />
        </ResizablePanel>
        <ResizableHandle className="bg-[#363636]" />
        <ResizablePanel>
          <pre className="p-2">{JSON.stringify(result, null, 2)}</pre>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
