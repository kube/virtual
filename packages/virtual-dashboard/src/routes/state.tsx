import type { VirtualStateFile } from "@kube/virtual";
import { use, useEffect, useState } from "react";
import {
  PanelResizeHandle as ResizableHandle,
  Panel as ResizablePanel,
  PanelGroup as ResizablePanelGroup,
} from "react-resizable-panels";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { VirtualDashboardContext } from "~/contexts/VirtualDashboard";
import { MonacoEditor } from "~/lib/MonacoEditor";

type StateEditorProps = {};

const StateOption: React.FC<{
  name: string;
  option: NonNullable<VirtualStateFile["options"]>[string];
  initialValue: any;
  onChange: (key: string, value: any) => void;
}> = ({ name, option, initialValue, onChange }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    onChange(name, value);
  }, [value]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <>
      <div className="">{name}</div>
      <div className="">
        {option.type === "Boolean" ? (
          <Switch checked={value} onCheckedChange={setValue} />
        ) : option.type === "String" ? (
          <Input
            type="text"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        ) : option.type === "Number" ? (
          <Tooltip>
            <TooltipTrigger className="w-full">
              <Slider
                max={100}
                step={1}
                value={[value]}
                onValueChange={(values) => setValue(values[0])}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs text-white">{option.type}</div>
            </TooltipContent>
          </Tooltip>
        ) : (
          "Invalid option type"
        )}
      </div>
    </>
  );
};

const StateOptions: React.FC<{
  options: VirtualStateFile["options"];
  initialValues: VirtualStateFile["optionsValues"];
  onChange: (key: string, value: any) => void;
}> = ({ options, initialValues, onChange }) => {
  const hasOptions = options && Object.keys(options).length > 0;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-xs opacity-50 py-1 px-2">Options</div>
      {hasOptions ? (
        <div className="grid grid-cols-2 gap-2 p-2">
          {Object.entries(options).map(([key, value]) => (
            <StateOption
              key={key}
              name={key}
              option={value}
              onChange={onChange}
              initialValue={initialValues?.[key]}
            />
          ))}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          No options available
        </div>
      )}
    </div>
  );
};

function StateEditor({}: StateEditorProps) {
  const { virtualServer, currentStateFile } = use(VirtualDashboardContext);

  function onSave() {
    if (currentStateFile) {
      virtualServer.updateStateFile({
        path: currentStateFile.stateFile.path,
        content: currentStateFile.model.getValue(),
      });
    }
  }

  return (
    <>
      <div className="flex flex-col h-full w-full grow bg-[#1e1e1e]">
        {currentStateFile?.stateFile.compilationError && (
          <div className="p-2 bg-red-700 text-white text-sm grow-0 shrink-0">
            Compilation Error
          </div>
        )}

        <ResizablePanelGroup direction="vertical">
          <ResizablePanel>
            <MonacoEditor
              className="h-full w-full"
              model={currentStateFile?.model}
              onSave={onSave}
            />
          </ResizablePanel>

          <ResizableHandle className="py-0.5 group">
            <div className="bg-white h-[1px] opacity-10 group-hover:opacity-20 group-active:opacity-40 transition-opacity duration-300" />
          </ResizableHandle>

          <ResizablePanel>
            {currentStateFile && (
              <StateOptions
                options={currentStateFile.stateFile.options ?? {}}
                initialValues={currentStateFile.stateFile.optionsValues ?? {}}
                onChange={(key, value) =>
                  virtualServer.updateStateFileOption(
                    currentStateFile.stateFile.path,
                    key,
                    value
                  )
                }
              />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
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
