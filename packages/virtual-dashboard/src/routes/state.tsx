import { use } from "react";
import { VirtualDashboardContext } from "~/contexts/VirtualDashboard";
import { MonacoEditor } from "~/lib/MonacoEditor";

type StateEditorProps = {};

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
