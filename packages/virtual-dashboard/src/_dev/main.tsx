import { createVirtualServer, type VirtualServerRemote } from "@kube/virtual";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { VirtualDashboard } from "..";

const root = createRoot(document.getElementById("root")!);

const App: React.FC = () => {
  const [server, setServer] = useState<VirtualServerRemote>();

  useEffect(() => {
    createVirtualServer.fromHttpServer("/").then(setServer);
  }, []);

  if (!server) return <div>Loading Schema...</div>;

  return <VirtualDashboard virtualServer={server} />;
};

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
