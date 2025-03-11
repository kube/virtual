import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { VirtualDashboard } from "../src";

import type { Schema_Index } from "@kube/structype";

const root = createRoot(document.getElementById("root")!);

// Read initial schema from window (set by Vite custom dev plugin)
const INITIAL_VIRTUAL_SCHEMA: Schema_Index = (window as any).__VIRTUAL_SCHEMA;

const App: React.FC = () => {
  const [schema, setSchema] = useState(INITIAL_VIRTUAL_SCHEMA);

  useEffect(() => {
    import.meta.hot?.on("virtual-server-api", setSchema);
  }, []);

  return <VirtualDashboard virtualAPI={{ schema } as any} />;
};

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
