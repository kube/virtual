import {
  Schema_Array,
  Schema_Enum,
  Schema_ID,
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

type Mapping = { [K: string]: any };

export type Infer_Primitive<S extends Schema_Primitive> = {
  number: number;
  string: string;
  boolean: boolean;
  null: null;
  undefined: undefined;
}[S["_structype"]];

export type Infer_Reference_Named<
  S extends Schema_Reference_Named,
  Root extends Schema_Index | never = never,
  TypeMapping extends Mapping = {},
  ScalarMapping extends Mapping = {}
> = S["ref"] extends keyof Root["types"]
  ? Infer_FromIndex<Root, S["ref"], TypeMapping, ScalarMapping>
  : never;

type Infer_RecordSchemaField<
  S extends Schema_Record["fields"][number],
  Root extends Schema_Index | never = never,
  TypeMapping extends Mapping = {},
  ScalarMapping extends Mapping = {}
> =
  | (S["type"] extends Schema_Reference_Named
      ? Infer_Reference_Named<S["type"], Root, TypeMapping, ScalarMapping>
      : S["type"] extends Schema_Primitive
      ? Infer_Primitive<S["type"]>
      : S["type"] extends Schema_Scalar
      ? Infer_Scalar<S["type"], ScalarMapping>
      : never)
  | (S["nullable"] extends true ? null : never);

export type Infer_RecordSchema<
  S extends Schema_Record,
  Root extends Schema_Index | never = never,
  TypeMapping extends Mapping = {},
  ScalarMapping extends Mapping = {}
> = {
  [K in S["fields"][number]["name"]]: Infer_RecordSchemaField<
    S["fields"][number] & { name: K },
    Root,
    TypeMapping,
    ScalarMapping
  >;
};

export type Infer_Scalar<
  S extends Schema_Scalar,
  ScalarMapping extends Mapping
> = S["name"] extends infer Name extends keyof ScalarMapping
  ? ScalarMapping[Name]
  : any;

export type Infer_Array<
  S extends Schema_Array,
  Root extends Schema_Index | never = never
> = Infer_Schema<S["item"], Root>[];

//
// Infer any type of Schema
//

export type Infer_Schema<
  S extends
    | Schema_ID
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
  Root extends Schema_Index | never = never,
  TypeMapping extends Mapping = {},
  ScalarMapping extends Mapping = {}
> = S extends Schema_Scalar
  ? Infer_Scalar<S, ScalarMapping>
  : S extends Schema_Record
  ? S["name"] extends infer Name extends keyof TypeMapping
    ? TypeMapping[Name]
    : Infer_RecordSchema<S, Root, TypeMapping, ScalarMapping>
  : S extends Schema_Array
  ? Infer_Array<S, Root>
  : S extends Schema_Reference_Named
  ? Infer_Reference_Named<S, Root, TypeMapping, ScalarMapping>
  : S extends Schema_Primitive
  ? Infer_Primitive<S>
  : never;

//
// Entry-point on Index Schema (given a type name)
//
export type Infer_FromIndex<
  S extends Schema_Index,
  TypeName extends keyof S["types"],
  TypeMapping extends { [K in keyof S["types"]]?: any } = {},
  ScalarMapping extends { [K in keyof S["types"]]?: any } = {}
> = Infer_Schema<S["types"][TypeName], S, TypeMapping, ScalarMapping>;
