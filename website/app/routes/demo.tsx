import { toStructype } from "@kube/structype-graphql";
import { type VirtualServer, createVirtualServer } from "@kube/virtual";
import { VirtualDashboard } from "@kube/virtual-dashboard";
import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { VirtualDashboardWrapper } from "~/components/VirtualDashboardWrapper";
import DemoApp from "~/demo/App";
import graphqlSchema from "~/demo/schema.graphql?raw";

const schema = toStructype(graphqlSchema);

export default function DemoPage() {
  const [virtualServer, setVirtualServer] = useState<VirtualServer>();

  useEffect(() => {
    const server = createVirtualServer({
      schema,
      initialStateFiles: [
        {
          path: "hello.state.ts",
          content: [
            `export default VirtualState({`,
            `  options: {},`,
            `  store: {},`,
            `  resolvers: {`,
            `    Query: {`,
            `      todos: () => [{}, {}],`,
            `    }`,
            `  },`,
            `});`,
          ].join("\n"),
        },
      ],
      api: {
        createStateFile: async (file: { path: string; content: string }) => {
          console.log("createStateFile", file);
          server.createdStateFile(file);
        },
        deleteStateFile: async (file: { path: string }) => {
          console.log("deleteStateFile", file);
        },
        updateStateFile: async (file: { path: string; content: string }) => {
          console.log("updateStateFile", file);
          server.createdStateFile(file);
        },
      },
    });
    setVirtualServer(server);
  }, [schema]);

  return (
    <div className="mt-4 w-full flex grow">
      {virtualServer && (
        <PanelGroup direction="vertical" className="w-full h-full">
          <Panel>
            <div className="relative h-full w-full">
              <VirtualDashboardWrapper className="absolute h-full w-full flex grow overflow-hidden rounded-md">
                <VirtualDashboard virtualServer={virtualServer} />
              </VirtualDashboardWrapper>
            </div>
          </Panel>

          <PanelResizeHandle className="flex justify-center items-center group">
            <div className="h-1 rounded-full w-10 m-1 bg-white opacity-10 group-hover:opacity-20 transition-opacity" />
          </PanelResizeHandle>

          <Panel>
            <div className="h-full w-full bg-gray-600 rounded-md p-4">
              <DemoApp virtualServer={virtualServer} />
            </div>
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
}
