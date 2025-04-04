import { Maximize2Icon, Minimize2Icon } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import {
  PanelResizeHandle as ResizableHandle,
  Panel as ResizablePanel,
  PanelGroup as ResizablePanelGroup,
} from "react-resizable-panels";
import { twMerge } from "tailwind-merge";
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

const PaneGroup: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [maximizedPane, setMaximizedPane] = useState<string>();

  function onMaximizeChange(id: string) {
    if (maximizedPane === id) {
      setMaximizedPane(undefined);
    } else {
      setMaximizedPane(id);
    }
  }

  return (
    <div className="p-2 pt-0 flex w-full h-full max-h-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="relative w-full h-full max-h-full"
      >
        <ResizablePanel minSize={10}>
          <Pane
            id="state-pane"
            title="State Editor"
            onMaximizeToggle={onMaximizeChange}
            maximizedPane={maximizedPane}
          >
            <StateView />
          </Pane>
        </ResizablePanel>
        <ResizableHandle className="rounded bg-transparent py-1 px-0.5 group">
          <div className="w-0.5 bg-white rounded-full h-full opacity-0 group-hover:opacity-15 transition-opacity group-active:opacity-30 duration-300" />
        </ResizableHandle>
        <ResizablePanel minSize={10}>
          <Pane
            id="graphiql-pane"
            title="GraphQL Query"
            onMaximizeToggle={onMaximizeChange}
            maximizedPane={maximizedPane}
          >
            <GraphiqlView />
          </Pane>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

const Pane: React.FC<
  React.PropsWithChildren<{
    id: string;
    title: string;
    maximizedPane?: string;
    onMaximizeToggle: (id: string) => void;
  }>
> = ({ id, title, maximizedPane, onMaximizeToggle, children }) => {
  const isMaximized = maximizedPane === id;
  const isMinimized = maximizedPane !== undefined && !isMaximized;

  return (
    <div
      className={twMerge(
        "flex h-full max-h-full",
        isMaximized && "absolute top-0 left-0, right-0 bottom-0 w-full",
        isMinimized && "hidden"
      )}
    >
      <div className="flex flex-col w-full h-full rounded-md overflow-hidden border border-gray-700 bg-[#131313]">
        <div className="grow-0 shrink-0 h-6 flex py-1 px-2 text-sm select-none overflow-hidden">
          <div className="grow flex items-center gap-1">
            <span className="text-xs text-gray-400 truncate">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            {isMaximized ? (
              <Minimize2Icon size={14} onClick={() => onMaximizeToggle(id)} />
            ) : (
              <Maximize2Icon size={14} onClick={() => onMaximizeToggle(id)} />
            )}
          </div>
        </div>
        <div className="relative grow overflow-hidden">
          <div className="absolute overflow-hidden top-0 left-0 bottom-0 right-0">
            {children}
          </div>
        </div>
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
      className="virtualDashboardRoot h-full max-h-full max-w-full w-full flex flex-col bg-gray-800"
    >
      <div className="text-white p-1.5 flex items-center justify-between max-h-full">
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

      <div className="flex flex-1 shrink-0">
        <PaneGroup />
      </div>
    </div>
  );
}
