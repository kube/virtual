import { GripHorizontalIcon, Maximize2Icon } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import { Logo } from "~/components/Logo";
import { Button } from "~/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import { VirtualDashboardContext } from "~/contexts/VirtualDashboard";
import "../app.css";
import GraphiqlView from "./graphiql";
import StateView from "./state";

const Pane: React.FC<React.PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  return (
    <div className="flex flex-1 h-full">
      <div className="flex flex-col w-full h-full rounded-md overflow-hidden border border-gray-700">
        <div className="grow-0 shrink-0 h-6 border-b border-b-gray-700 flex py-1 px-2 text-sm select-none">
          <div className="grow flex items-center gap-1">
            <GripHorizontalIcon size={14} />
            <span className="text-xs text-gray-300">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2Icon size={14} />
          </div>
        </div>
        <div className="grow">{children}</div>
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

  const rootRef = useRef<HTMLDivElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
        setPaletteOpen(true);
      }
    }
    rootRef.current?.addEventListener("keydown", onKeyDown);
    return () => rootRef.current?.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={rootRef}
      className="virtualDashboardRoot h-full w-full flex flex-col bg-gray-800 focus:bg-gray-900"
      tabIndex={-1}
    >
      <div className="text-white p-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 ml-1 opacity-70 h-7 select-none">
          <Logo className="w-6 fill-white" />
          <h1>virtual</h1>
        </div>

        <div>
          <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>
                <CommandItem>Search Emoji</CommandItem>
                <CommandItem>Calculator</CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem>Profile</CommandItem>
                <CommandItem>Billing</CommandItem>
                <CommandItem>Settings</CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
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
          <Pane title="GraphQL Query">
            <GraphiqlView />
          </Pane>
          <Pane title="State Editor">
            <StateView />
          </Pane>
        </div>
      </div>
    </div>
  );
}
