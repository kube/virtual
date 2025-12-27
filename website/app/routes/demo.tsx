import { toStructype } from "@kube/structype-graphql";
import { type VirtualServer, createVirtualServer } from "@kube/virtual";
import { VirtualDashboard } from "@kube/virtual-dashboard";
import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DemoRouter, useDemoRouter } from "~/components/DemoRouter";
import { VirtualDashboardWrapper } from "~/components/VirtualDashboardWrapper";
import DemoApp from "~/demo/App";
import graphqlSchema from "~/demo/schema.graphql?raw";

const schema = toStructype(graphqlSchema);

// Fake URL Bar component
const FakeURLBar: React.FC = () => {
  const { currentRoute } = useDemoRouter();

  return (
    <div
      style={{
        userSelect: "none",
        border: "1px solid #d1d5db44",
        borderRadius: "4px",
        padding: "4px 8px",
        fontFamily:
          "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
        fontSize: "13px",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
      }}
    >
      <span style={{ opacity: 0.6, fontWeight: "400" }}>app.virtual</span>
      <span style={{ fontWeight: "500" }}>{currentRoute}</span>
    </div>
  );
};

export default function DemoPage() {
  const [virtualServer, setVirtualServer] = useState<VirtualServer>();

  useEffect(() => {
    const server = createVirtualServer({
      schema,
      initialStateFiles: [
        {
          path: "hello.state.ts",
          content: [
            `export default VirtualState(`,
            `  {`,
            `    option1: { type: "Boolean" }`,
            `  },`,
            `  (options) => ({`,
            `    resolvers: {`,
            `      Query: {`,
            `        todos: () => options.option1 ? []: [{}, {}],`,
            `      }`,
            `    },`,
            `  })`,
            `);`,
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
            <div className="h-full w-full bg-gray-600 rounded-md p-2 flex flex-col gap-1.5">
              <DemoRouter initialRoute="/customers">
                <FakeURLBar />
                <div className="h-full w-full rounded bg-white overflow-y-scroll">
                  <DemoApp virtualServer={virtualServer} />
                </div>
              </DemoRouter>
            </div>
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
}
