import { Logo } from "~/components/Logo";
import "../app.css";
import SplitView from "./split";

export default function RootView() {
  return (
    <div className="virtualDashboardRoot h-full w-full flex flex-col">
      <div className="bg-gray-800 text-white p-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 ml-1 opacity-50">
          <Logo className="w-6 fill-white" />
          <h1>virtual</h1>
        </div>
      </div>

      <div className="flex flex-1">
        <SplitView />
      </div>
    </div>
  );
}
