import { HKT, Object } from "@kube/hkt";
import {
  GetRecordFields,
  Infer_Schema,
  Schema_Index,
  Schema_Interface,
  Schema_Record,
} from "@kube/structype";

type Simplify<T> = { [K in keyof T]: T[K] };

interface $Input_Record_TypeMapper extends HKT {
  return: Infer_Schema<this["A"]["type"]>;
}

type RecordToInputType<S extends Schema_Record | Schema_Interface> = Partial<
  Object.MapValues<GetRecordFields<S>, $Input_Record_TypeMapper>
>;

// TODO: This type could be tested separately
type GetDerivedTypesInSchema_Index<
  S extends Schema_Index,
  InterfaceName extends string
> = S["types"][keyof S["types"]] extends infer X
  ? X extends infer T extends {
      name: string;
      implements: { _structype: "ref_named"; ref: string }[];
    }
    ? InterfaceName extends T["implements"][number]["ref"]
      ? T["name"]
      : never
    : never
  : never;

type GetTypenameFromSchema_Index_Type<
  S extends Schema_Index,
  TypeName extends keyof S["types"]
> = S["types"][TypeName] extends infer T extends { name: string }
  ? T extends Schema_Record
    ? {
        __typename?: T["name"];
      } & RecordToInputType<T>
    : T extends Schema_Interface
    ? {
        __typename: GetDerivedTypesInSchema_Index<S, T["name"]>;
      } & RecordToInputType<T>
    : never
  : never;

interface $Input_Store_TypeMapper extends HKT {
  return: [this["A"], this["B"]] extends [
    infer T extends Schema_Index["types"][any],
    infer S extends Schema_Index
  ]
    ? T extends { name: keyof S["types"] }
      ? Array<Simplify<GetTypenameFromSchema_Index_Type<S, T["name"]>>>
      : never
    : never;
}

interface $Input_Store_FilterTypesPredicate extends HKT {
  return: this["B"]["_structype"] extends "interface" | "record" ? true : false;
}

type Input_Store<S extends Schema_Index> = Object.MapValues<
  Object.FilterProperties<S["types"], $Input_Store_FilterTypesPredicate>,
  $Input_Store_TypeMapper,
  S
>;

export type Input<S extends Schema_Index> = {
  store: Input_Store<S>;
};
