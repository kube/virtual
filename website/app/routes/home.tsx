import { toStructype } from "@kube/structype-graphql";
import { type VirtualServer, createVirtualServer } from "@kube/virtual";
import { VirtualDashboard } from "@kube/virtual-dashboard";
import { useEffect, useState } from "react";
import { DemoApp } from "~/components/DemoApp";
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
    <div className="container h-svh mx-auto flex justify-center items-center flex-col p-6">
      <div className="flex gap-2 select-none">
        <Logo className="w-10" />
        <span className="text-3xl">virtual</span>
      </div>

      <div className="mt-4 w-full flex grow">
        {virtualServer && (
          <div className="flex flex-col grow">
            <div className="relative grow">
              <VirtualDashboardWrapper className="absolute h-full w-full flex grow overflow-hidden rounded-md">
                <VirtualDashboard virtualServer={virtualServer} />
              </VirtualDashboardWrapper>
            </div>

            <div className="flex-grow-[0.6] bg-gray-600 rounded-md mt-4 p-4">
              <DemoApp virtualServer={virtualServer} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
