import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useVirtualServer } from "~/contexts/Virtual";
import { MonacoEditor } from "~/lib/MonacoEditor";
import { useConfigMonaco } from "~/lib/useConfigMonaco";

//
// TODO: Move this somewhere else
//
export function useProxyCallback<Fn extends (...args: never[]) => unknown>(
  fn: Fn
): Fn;

export function useProxyCallback(fn: Function) {
  const callbackRef = useRef<typeof fn>(fn);
  callbackRef.current = fn;
  return useCallback((...args: any[]) => callbackRef.current(...args), []);
}

type StateEditorProps = {};

function StateEditor({}: StateEditorProps) {
  const { virtualServer } = useVirtualServer();
  const { stateFilesMap } = useConfigMonaco(virtualServer);

  const [currentStateFilePath, setCurrentStateFilePath] = useState<string>();
  const currentStateFile = currentStateFilePath
    ? stateFilesMap[currentStateFilePath]
    : undefined;

  useEffect(() => {
    // If no currentStateFilePath, or not in the stateFilesMap, set to first one, or undefined if none
    if (!currentStateFilePath || !stateFilesMap[currentStateFilePath]) {
      const firstStateFile = Object.values(stateFilesMap)[0];
      setCurrentStateFilePath(firstStateFile?.stateFile.path);
    }
  }, [currentStateFilePath, stateFilesMap]);

  const onSave = useProxyCallback(() => {
    if (currentStateFile) {
      virtualServer.updateStateFile({
        path: currentStateFile.stateFile.path,
        content: currentStateFile.model.getValue(),
      });
    }
  });

  return (
    <>
      <div className="grow-0 shrink-0 p-1 flex gap-1 bg-black">
        {Object.entries(stateFilesMap).map(([path], index) => (
          <Button
            className="pr-2"
            key={path}
            onClick={() => setCurrentStateFilePath(path)}
          >
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
      <div className="w-full grow">
        <MonacoEditor
          className="h-full w-full"
          model={currentStateFile?.model}
          onSave={onSave}
        />
      </div>
    </>
  );
}

export default function StateView() {
  return (
    <div className="h-full w-full flex flex-col">
      <StateEditor />
    </div>
  );
}
