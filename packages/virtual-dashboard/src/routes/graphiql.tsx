import { QueryEditor } from "@graphiql/react";

export default function GraphiqlView() {
  return (
    <div
      style={{
        "--font-size-body": "13px",
        "--font-family-mono": "DM Mono",
      }}
      className="grow h-full graphiql-container text-xs"
    >
      <QueryEditor />
    </div>
  );
}
