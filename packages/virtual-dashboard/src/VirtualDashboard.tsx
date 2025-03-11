import type { VirtualServerAPI } from "@kube/virtual";
import { createMemoryRouter, RouterProvider } from "react-router";
import { MonacoProvider } from "~/contexts/Monaco";
import { VirtualContext } from "~/contexts/Virtual";
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
  virtualAPI: VirtualServerAPI;
};

export const VirtualDashboard: React.FC<VirtualDashboardProps> = ({
  virtualAPI,
}) => {
  return (
    <MonacoProvider>
      <VirtualContext.Provider value={virtualAPI}>
        <RouterProvider router={router} />
      </VirtualContext.Provider>
    </MonacoProvider>
  );
};
