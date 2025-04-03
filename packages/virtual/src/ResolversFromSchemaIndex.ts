import type {
  Infer_FromIndex,
  Infer_Schema,
  Schema_Index,
  Schema_Record,
} from "@kube/structype";

type ResolverFromSchema<
  S extends Schema_Index,
  TypeName extends keyof S["types"],
  TypeMapping extends { [K in keyof S["types"]]?: any } = {},
  ScalarMapping extends { [K in keyof S["types"]]?: any } = {}
> = S["types"][TypeName] extends Schema_Record
  ? {
      [K in S["types"][TypeName]["fields"][number]["name"]]?: (
        parent: Infer_FromIndex<S, TypeName, TypeMapping, ScalarMapping>,
        args: any,
        context: any
      ) => Partial<
        Infer_Schema<
          // TODO: Create helper to simplify this complex inline expression
          (S["types"][TypeName]["fields"][number] & { name: K })["type"],
          S,
          TypeMapping,
          ScalarMapping
        >
      >;
    }
  : never;

export type ResolversFromSchemaIndex<
  S extends Schema_Index,
  TypeMapping extends { [K in keyof S["types"]]?: any } = {},
  ScalarMapping extends { [K in keyof S["types"]]?: any } = {}
> = {
  [K in keyof S["types"]]?: ResolverFromSchema<
    S,
    K,
    TypeMapping,
    ScalarMapping
  >;
};
