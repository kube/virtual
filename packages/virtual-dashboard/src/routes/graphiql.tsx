import { QueryEditor } from "@graphiql/react";

export default function GraphiqlView() {
  return (
    <div className="grow h-full graphiql-container">
      <QueryEditor />
    </div>
  );
}
