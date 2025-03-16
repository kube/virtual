import { createVirtualServer, type VirtualServer } from "@kube/virtual";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { VirtualDashboard } from "../src";

const root = createRoot(document.getElementById("root")!);

const App: React.FC = () => {
  const [server, setServer] = useState<VirtualServer>();

  useEffect(() => {
    createVirtualServer.fromHttpServer("/").then((server) => {
      setServer(server);
    });
  }, []);

  if (!server) return <div>Loading Schema...</div>;

  return <VirtualDashboard virtualServer={server} />;
};

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
