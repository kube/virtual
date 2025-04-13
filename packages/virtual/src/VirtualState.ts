import { Schema_Index } from "@kube/structype";
import { ResolversFromSchemaIndex } from "./ResolversFromSchemaIndex";

type VirtualStateOptions_Item = {
  type: "Boolean" | "Number" | "String";
};

type VirtualStateOptions = {
  [key: string]: VirtualStateOptions_Item;
};

export interface VirtualState<
  S extends Schema_Index = Schema_Index,
  O extends VirtualStateOptions = {}
> {
  store?: {};
  options: O;
  resolvers: ResolversFromSchemaIndex<S, {}, {}>;
}

type InferVirtualStateOptions_Item<I extends VirtualStateOptions_Item> =
  I extends { type: "Boolean" }
    ? boolean
    : I extends { type: "Number" }
    ? number
    : I extends { type: "String" }
    ? string
    : never;

type InferVirtualStateOptions<O extends VirtualStateOptions> = {
  [K in keyof O]: InferVirtualStateOptions_Item<O[K]>;
};

export interface VirtualStateConstructor<
  S extends Schema_Index = Schema_Index,
  O extends VirtualStateOptions = {}
> {
  (
    props:
      | VirtualState<S, O>
      | ((
          options: InferVirtualStateOptions<O>
        ) => Omit<VirtualState<S, O>, "options">)
  ): VirtualState<S, O>;
  withOptions: <O extends VirtualStateOptions>(
    options: O
  ) => VirtualStateConstructor<S, O>;
}
