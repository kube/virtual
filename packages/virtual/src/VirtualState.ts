import { Schema_Index } from "@kube/structype";
import { ResolversFromSchemaIndex } from "./ResolversFromSchemaIndex";

export type VirtualStateOptions_Item = {
  type: "Boolean" | "Number" | "String";
};

export type VirtualStateOptions = {
  [key: string]: VirtualStateOptions_Item;
};

export interface VirtualStateProperties<S extends Schema_Index = Schema_Index> {
  store?: {};
  resolvers: ResolversFromSchemaIndex<S, {}, {}>;
}

// All VirtualState/VirtualStateOptions/VitualStateProperties/VirtualStateConstructor should be renamed (maybe refactored)
export interface VirtualState<
  S extends Schema_Index = Schema_Index,
  O extends VirtualStateOptions = { [key: string]: VirtualStateOptions_Item }
> {
  options: O;
  (options: InferVirtualStateOptions<O>): VirtualStateProperties<S>;
}

type InferVirtualStateOptions_Item<I extends VirtualStateOptions_Item> =
  I extends { type: "Boolean" }
    ? boolean
    : I extends { type: "Number" }
    ? number
    : I extends { type: "String" }
    ? string
    : never;

export type InferVirtualStateOptions<O extends VirtualStateOptions> = {
  [K in keyof O]: InferVirtualStateOptions_Item<O[K]>;
};

export interface VirtualStateConstructor<
  S extends Schema_Index = Schema_Index
> {
  (state: Omit<VirtualState<S>, "options">): VirtualState<S>;

  <O extends VirtualStateOptions = {}>(
    options: O,
    stateFn: (
      options: InferVirtualStateOptions<O>
    ) => Omit<VirtualState<S, O>, "options">
  ): VirtualState<S, O>;
}
