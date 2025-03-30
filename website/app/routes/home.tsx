import { toStructype } from "@kube/structype-graphql";
import { type VirtualServer, createVirtualServer } from "@kube/virtual";
import { VirtualDashboard } from "@kube/virtual-dashboard";
import { useEffect, useState } from "react";
import { Logo } from "~/components/Logo";
import { VirtualDashboardWrapper } from "~/components/VirtualDashboardWrapper";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Virtual" },
    { name: "description", content: "Virtual Website" },
  ];
}

const schema = toStructype(`
  type Query {
    hello: String
  }
`);

export default function Home() {
  const [virtualServer, setVirtualServer] = useState<VirtualServer>();

  useEffect(() => {
    const server = createVirtualServer({
      schema,
      api: {
        createStateFile: async (file: { path: string; content: string }) => {
          console.log("createStateFile", file);
        },
        deleteStateFile: async (file: { path: string }) => {
          console.log("deleteStateFile", file);
        },
        updateStateFile: async (file: { path: string; content: string }) => {
          console.log("updateStateFile", file);
        },
      },
    });
    server.createdStateFile({
      path: "hello.state.ts",
      content: `export default VirtualState({});`,
    });
    setVirtualServer(server);
  }, []);

  return (
    <div className="container h-svh mx-auto flex justify-center items-center flex-col">
      <div className="flex gap-2">
        <Logo className="w-11" />
        <span className="text-4xl">virtual</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-md w-[80%] h-[60%] relative">
        {virtualServer && (
          <VirtualDashboardWrapper>
            <VirtualDashboard virtualServer={virtualServer} />
          </VirtualDashboardWrapper>
        )}
      </div>
    </div>
  );
}
