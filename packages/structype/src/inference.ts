import {
  Schema_Array,
  Schema_Enum,
  Schema_Index,
  Schema_Input,
  Schema_Interface,
  Schema_Literal,
  Schema_Primitive,
  Schema_Record,
  Schema_Reference_Named,
  Schema_Reference_Thunk,
  Schema_Scalar,
  Schema_Union,
} from "./Schema";

export type Infer_Primitive<S extends Schema_Primitive> = {
  number: number;
  string: string;
  boolean: boolean;
  null: null;
  undefined: undefined;
}[S["_structype"]];

export type Infer_Reference_Named<
  S extends Schema_Reference_Named,
  Root extends Schema_Index | never = never
> = S["ref"] extends keyof Root["types"]
  ? Infer_FromIndex<Root, S["ref"]>
  : never;

type Infer_RecordSchemaField<
  S extends Schema_Record["fields"][number],
  Root extends Schema_Index | never = never
> =
  | (S["type"] extends Schema_Reference_Named
      ? Infer_Reference_Named<S["type"], Root>
      : S["type"] extends Schema_Primitive
      ? Infer_Primitive<S["type"]>
      : S["type"] extends Schema_Scalar
      ? Infer_Scalar<S["type"]>
      : never)
  | (S["nullable"] extends true ? null : never);

export type Infer_RecordSchema<
  S extends Schema_Record,
  Root extends Schema_Index | never = never
> = {
  [K in S["fields"][number]["name"]]: Infer_RecordSchemaField<
    S["fields"][number] & { name: K },
    Root
  >;
};

export type Infer_Scalar<_S extends Schema_Scalar> = any; // TODO: Use additional info

export type Infer_Array<
  S extends Schema_Array,
  Root extends Schema_Index | never = never
> = Infer_Schema<S["item"], Root>[];

//
// Infer any type of Schema
//

export type Infer_Schema<
  S extends
    | Schema_Primitive
    | Schema_Literal
    | Schema_Record
    | Schema_Scalar
    | Schema_Array
    | Schema_Reference_Thunk
    | Schema_Reference_Named
    | Schema_Input
    | Schema_Interface
    | Schema_Enum
    | Schema_Union,
  Root extends Schema_Index | never = never
> = S extends Schema_Scalar
  ? S["name"]
  : S extends Schema_Record
  ? Infer_RecordSchema<S, Root>
  : S extends Schema_Primitive
  ? Infer_Primitive<S>
  : S extends Schema_Array
  ? Infer_Array<S, Root>
  : never;

//
// Entry-point on Index Schema (given a type name)
//
export type Infer_FromIndex<
  S extends Schema_Index,
  TypeName extends keyof S["types"]
> = Infer_Schema<S["types"][TypeName], S>;
