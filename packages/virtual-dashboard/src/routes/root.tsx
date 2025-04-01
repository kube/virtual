import { use } from "react";
import { Logo } from "~/components/Logo";
import { Button } from "~/components/ui/button";
import { VirtualDashboardContext } from "~/contexts/VirtualDashboard";
import "../app.css";
import GraphiqlView from "./graphiql";
import StateView from "./state";

const Pane: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-1 h-full">
      <div className="flex flex-col w-full h-full rounded-md overflow-hidden border border-gray-700">
        {children}
      </div>
    </div>
  );
};

export default function RootView() {
  const {
    virtualServer,
    stateFilesMap,
    setCurrentStateFilePath,
    currentStateFile,
  } = use(VirtualDashboardContext);

  return (
    <div className="virtualDashboardRoot h-full w-full flex flex-col bg-gray-800">
      <div className="text-white p-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 ml-1 opacity-70 h-7 select-none">
          <Logo className="w-6 fill-white" />
          <h1>virtual</h1>
        </div>

        <div className="flex items-center gap-1">
          {Object.entries(stateFilesMap).map(([path], index) => (
            <Button key={path} onClick={() => setCurrentStateFilePath(path)}>
              {path.toString().replace("inmemory://_virtual/states/", "")}
              {currentStateFile?.stateFile.path === path && (
                <div className="w-4 flex justify-center">
                  <div
                    className={[
                      "rounded-4xl w-2 h-2",
                      currentStateFile.isDirty ? "bg-red-600" : "bg-slate-400",
                    ].join(" ")}
                  />
                </div>
              )}
            </Button>
          ))}
          <Button
            onClick={() =>
              virtualServer.createStateFile({
                path: "new.state.ts",
                content: "export default VirtualState({})",
              })
            }
          >
            +
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-full flex gap-2 p-2 pt-0">
          <Pane>
            <GraphiqlView />
          </Pane>
          <Pane>
            <StateView />
          </Pane>
        </div>
      </div>
    </div>
  );
}
