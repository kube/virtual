import GraphiqlView from "./graphiql";
import StateView from "./state";

export default function SplitView() {
  return (
    <div className="h-full w-full flex">
      <div className="flex w-[60%] h-full">
        <GraphiqlView />
      </div>
      <div className="flex w-[40%] h-full">
        <StateView />
      </div>
    </div>
  );
}
