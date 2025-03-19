import type { VirtualServerRemote } from "@kube/virtual";
import { createMemoryRouter, RouterProvider } from "react-router";
import { MonacoProvider } from "~/contexts/Monaco";
import { VirtualServerProvider } from "~/contexts/Virtual";
import GraphiqlView from "~/routes/graphiql";

import Home from "~/routes/main";
import StateView from "~/routes/state";

const router = createMemoryRouter([
  {
    path: "/",
    Component: Home,
    children: [
      {
        path: "/",
        index: true,
        Component: StateView,
      },
      {
        path: "/graphiql",
        Component: GraphiqlView,
      },
    ],
  },
]);

type VirtualDashboardProps = {
  virtualServer: VirtualServerRemote;
};

export const VirtualDashboard: React.FC<VirtualDashboardProps> = ({
  virtualServer,
}) => {
  return (
    <MonacoProvider>
      <VirtualServerProvider virtualServer={virtualServer}>
        <RouterProvider router={router} />
      </VirtualServerProvider>
    </MonacoProvider>
  );
};
