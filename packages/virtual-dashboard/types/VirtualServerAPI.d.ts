import type { Schema_Index } from "@kube/structype";

type Disposer = () => void;

export type VirtualServerAPI = {
  schema: Schema_Index;
  send: (message: string) => void;
  listen: (
    callback: (event: "schema_updated", schema: Schema_Index) => void
  ) => Disposer;
};
