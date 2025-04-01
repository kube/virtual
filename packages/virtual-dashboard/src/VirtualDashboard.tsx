import type { VirtualServerRemote } from "@kube/virtual";
import { MonacoProvider } from "~/contexts/Monaco";
import { VirtualServerProvider } from "~/contexts/Virtual";
import RootView from "./routes/root";

type VirtualDashboardProps = {
  virtualServer: VirtualServerRemote;
};

export const VirtualDashboard: React.FC<VirtualDashboardProps> = ({
  virtualServer,
}) => {
  return (
    <MonacoProvider>
      <VirtualServerProvider virtualServer={virtualServer}>
        <RootView />
      </VirtualServerProvider>
    </MonacoProvider>
  );
};
