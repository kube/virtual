import type { VirtualServerRemote } from "@kube/virtual";
import { MonacoProvider } from "~/contexts/Monaco";
import { VirtualContextProvider } from "~/contexts/Virtual";
import { VirtualDashboardContextProvider } from "./contexts/VirtualDashboard";
import RootView from "./routes/root";

type VirtualDashboardProps = {
  virtualServer: VirtualServerRemote;
};

export const VirtualDashboard: React.FC<VirtualDashboardProps> = ({
  virtualServer,
}) => {
  return (
    <MonacoProvider>
      <VirtualContextProvider virtualServer={virtualServer}>
        <VirtualDashboardContextProvider>
          <RootView />
        </VirtualDashboardContextProvider>
      </VirtualContextProvider>
    </MonacoProvider>
  );
};
