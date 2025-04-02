import { QueryEditor } from "@graphiql/react";

export default function GraphiqlView() {
  return (
    <div
      style={{
        "--editor-background": "#1e1e1e",
        "--font-size-body": "13px",
        "--font-family-mono": "DM Mono",
      }}
      className="grow h-full graphiql-container text-xs bg-[#1e1e1e] py-2"
    >
      <QueryEditor />
    </div>
  );
}
