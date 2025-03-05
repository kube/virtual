import type { Schema_Index } from "@kube/structype";

export type VirtualServerAPI = {
  schema: Schema_Index;
  callback: (message: string) => void;
};
