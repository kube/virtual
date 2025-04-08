import { Schema_Index } from "@kube/structype";
import { ResolversFromSchemaIndex } from "./ResolversFromSchemaIndex";

type VirtualStateOptions_Item = {
  type: "Boolean" | "Number" | "String";
};

type VirtualStateOptions = {
  [key: string]: VirtualStateOptions_Item;
};

export type VirtualState<S extends Schema_Index> = {
  store?: {};
  options?: VirtualStateOptions;
  resolvers: ResolversFromSchemaIndex<S>;
};
