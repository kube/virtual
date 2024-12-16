export type Schema_ID = {
  _structype: "id";
  description?: string;
};

export type Schema_Number = {
  _structype: "number";
  int?: boolean;
  description?: string;
};

export type Schema_String = {
  _structype: "string";
  description?: string;
};

export type Schema_Boolean = {
  _structype: "boolean";
  description?: string;
};

export type Schema_Primitive = Schema_Number | Schema_String | Schema_Boolean;

export type Schema_Literal = {
  _structype: "literal";
  value: string | number | boolean;
  description?: string;
};

export type Schema_Reference_Named = {
  _structype: "ref_named";
  ref: string;
  description?: string;
};

export type Schema_Reference_Thunk = {
  _structype: "ref_thunk";
  ref: () => { _structype: string };
  description?: string;
};

export type Schema_Scalar = {
  _structype: "scalar";
  description?: string;
  name: string;
};

export type Schema_Interface = {
  _structype: "interface";
  name: string;
  description?: string;
  fields: Array<{
    name: string;
    description?: string;
    args?: Array<{
      name: string;
      description?: string;
      nullable?: boolean;
      type:
        | Schema_ID
        | Schema_Primitive
        | Schema_Literal
        | Schema_Reference_Named
        | Schema_Scalar
        | Schema_Record
        | Schema_Array;
    }>;
    type:
      | Schema_ID
      | Schema_Primitive
      | Schema_Literal
      | Schema_Reference_Named
      | Schema_Scalar
      | Schema_Record
      | Schema_Array;
  }>;
};

export type Schema_Record = {
  _structype: "record";
  name: string;
  implements?: Array<Schema_Reference_Named>;
  description?: string;
  fields: Array<{
    name: string;
    description?: string;
    args?: Array<{
      name: string;
      description?: string;
      nullable?: boolean;
      type:
        | Schema_ID
        | Schema_Primitive
        | Schema_Literal
        | Schema_Reference_Named
        | Schema_Scalar
        | Schema_Record
        | Schema_Array;
    }>;
    nullable?: boolean;
    type:
      | Schema_ID
      | Schema_Primitive
      | Schema_Literal
      | Schema_Reference_Named
      | Schema_Scalar
      | Schema_Record
      | Schema_Array;
  }>;
};

export type Schema_Array = {
  _structype: "array";
  nullableItems?: boolean;
  item:
    | Schema_Primitive
    | Schema_Literal
    | Schema_Reference_Named
    | Schema_Scalar
    | Schema_Record
    | Schema_Array;
};

// TODO: In the future Enums could also support default index-based values (like C or TypeScript do by default).
// Fow now, we only support what is required by the GraphQL DSL.
export type Schema_Enum = {
  _structype: "enum";
  name: string;
  description?: string;
  values: Array<string>;
};

export type Schema_Union = {
  _structype: "union";
  name?: string; // name is optional because unions can be anonymous in TypeScript
  description?: string;
  types: Array<Schema_Reference_Named>; // TODO: Support inline unions
};

export type Schema_Input = {
  _structype: "input";
  name: string;
  description?: string;
  fields: Array<{
    name: string;
    description?: string;
    nullable?: boolean;
    type:
      | Schema_ID
      | Schema_Primitive
      | Schema_Literal
      | Schema_Reference_Named
      | Schema_Scalar
      | Schema_Record
      | Schema_Array;
  }>;
};

export type Schema_Index = {
  _structype: "index";
  description?: string;
  types: {
    [k: string]:
      | Schema_Record
      | Schema_Scalar
      | Schema_Enum
      | Schema_Interface
      | Schema_Union
      | Schema_Input;
  };
};

export type Schema =
  | Schema_ID
  | Schema_Number
  | Schema_String
  | Schema_Boolean
  | Schema_Primitive
  | Schema_Literal
  | Schema_Reference_Named
  | Schema_Reference_Thunk
  | Schema_Scalar
  | Schema_Interface
  | Schema_Record
  | Schema_Array
  | Schema_Enum
  | Schema_Union
  | Schema_Input
  | Schema_Index;
