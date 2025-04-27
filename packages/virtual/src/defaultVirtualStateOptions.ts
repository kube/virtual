import { Schema_Index } from "@kube/structype";
import {
  InferVirtualStateOptions,
  VirtualState,
  VirtualStateOptions,
} from "./VirtualState.js";

export function defaultVirtualStateOptions<
  S extends Schema_Index,
  O extends VirtualStateOptions
>(virtualState: VirtualState<S, O>): InferVirtualStateOptions<O> {
  return Object.fromEntries(
    Object.entries(virtualState.options).map(([key, value]) => {
      switch (value.type) {
        case "Boolean":
          return [key, false];
        case "Number":
          return [key, 0];
        case "String":
          return [key, ""];
        default:
          throw new Error(`Unknown type: ${value.type}`);
      }
    })
  );
}
