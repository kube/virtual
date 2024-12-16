import { Schema_Index } from "./Schema";

export function serialize(schema: Schema_Index): string {
  // For now this only serializes Schema_Index with no thunk ref.
  // (as this would imply handling circular references, not handled by JSON.stringify)
  //
  // In the future, serializer will have a real implementation.
  return JSON.stringify(schema);
}
