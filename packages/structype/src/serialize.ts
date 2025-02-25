import { Schema_Index } from "./Schema";

type OutputFormat = "json" | "ts";

export function serialize(
  schema: Schema_Index,
  format: OutputFormat = "json"
): string {
  // For now this only serializes Schema_Index with no thunk ref.
  // (as this would imply handling circular references, not handled by JSON.stringify)
  //
  // In the future, serializer will have a real implementation.

  if (format === "ts") {
    return `import type { Schema_Index } from "@kube/structype";

export default ${JSON.stringify(schema, null, 2)} satisfies Schema_Index;\n`;
  }

  return JSON.stringify(schema, null, 2);
}
