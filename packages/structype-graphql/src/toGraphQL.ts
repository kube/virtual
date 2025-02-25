import {
  Schema,
  Schema_Array,
  Schema_Enum,
  Schema_Index,
  Schema_Input,
  Schema_Interface,
  Schema_Record,
  Schema_Union,
} from "@kube/structype";
import * as graphql from "graphql";
import { Kind } from "graphql";

function toGraphql_NamedType(schema: Schema): graphql.NamedTypeNode {
  let typeName;

  switch (schema._structype) {
    case "string":
      typeName = "String";
      break;

    case "number":
      typeName = schema.int ? "Int" : "Float";
      break;

    case "id":
      typeName = "ID";
      break;

    case "boolean":
      typeName = "Boolean";
      break;

    case "ref_named":
      typeName = schema.ref;
      break;

    default:
      throw new Error(`Unsupported type: ${schema._structype}`);
  }
  return {
    kind: Kind.NAMED_TYPE,
    name: toGraphql_Name(typeName),
  };
}

function toGraphql_Name(name: string): graphql.NameNode {
  return {
    kind: Kind.NAME,
    value: name,
  };
}

function toGraphql_Description(
  description: string | undefined
): graphql.StringValueNode | undefined {
  return description
    ? {
        kind: Kind.STRING,
        value: description,
      }
    : undefined;
}

function toGraphql_Nullable_If<T extends graphql.TypeNode>(
  condition: boolean | undefined,
  type: T
) {
  return condition ? type : { kind: Kind.NON_NULL_TYPE as const, type };
}

function toGraphql_from_Schema_Array(
  schema: Schema_Array
): graphql.ListTypeNode {
  return {
    kind: Kind.LIST_TYPE,
    type: toGraphql_Nullable_If(
      schema.nullableItems,
      toGraphql_NamedType(schema.item)
    ),
  };
}

function toGraphql_from_Schema_Record_Field(
  schemaField: Schema_Record["fields"][number]
): graphql.FieldDefinitionNode {
  return {
    kind: Kind.FIELD_DEFINITION,
    name: toGraphql_Name(schemaField.name),
    type: toGraphql_Nullable_If(
      schemaField.nullable,
      schemaField.type._structype === "array"
        ? toGraphql_from_Schema_Array(schemaField.type)
        : toGraphql_NamedType(schemaField.type)
    ),
    arguments: schemaField.args?.map((arg) => ({
      kind: Kind.INPUT_VALUE_DEFINITION,
      name: toGraphql_Name(arg.name),
      type: toGraphql_Nullable_If(arg.nullable, toGraphql_NamedType(arg.type)),
      description: toGraphql_Description(arg.description),
    })),
    description: toGraphql_Description(schemaField.description),
  };
}

function toGraphql_from_Schema_Record(
  schema: Schema_Record
): graphql.ObjectTypeDefinitionNode {
  return {
    kind: Kind.OBJECT_TYPE_DEFINITION,
    name: toGraphql_Name(schema.name),
    fields: schema.fields.map(toGraphql_from_Schema_Record_Field),
    description: toGraphql_Description(schema.description),
    interfaces: schema.implements?.map(toGraphql_NamedType),
  };
}

function toGraphql_from_Schema_Interface(
  schema: Schema_Interface
): graphql.InterfaceTypeDefinitionNode {
  return {
    kind: Kind.INTERFACE_TYPE_DEFINITION,
    name: toGraphql_Name(schema.name),
    fields: schema.fields.map(toGraphql_from_Schema_Record_Field),
    description: toGraphql_Description(schema.description),
  };
}

function toGraphql_from_Schema_Enum(
  schema: Schema_Enum
): graphql.EnumTypeDefinitionNode {
  return {
    kind: Kind.ENUM_TYPE_DEFINITION,
    name: toGraphql_Name(schema.name),
    values: schema.values.map((value) => ({
      kind: Kind.ENUM_VALUE_DEFINITION,
      name: toGraphql_Name(value),
    })),
    description: toGraphql_Description(schema.description),
  };
}

function toGraphql_from_Schema_Union(
  schema: Schema_Union
): graphql.UnionTypeDefinitionNode {
  if (schema.types.length === 0) {
    throw new Error("Union must have at least one type");
  }
  if (!schema.name) {
    throw new Error("Union must have a name for GraphQL");
  }
  return {
    kind: Kind.UNION_TYPE_DEFINITION,
    name: toGraphql_Name(schema.name),
    types: schema.types.map(toGraphql_NamedType),
    description: toGraphql_Description(schema.description),
  };
}

function toGraphql_from_Schema_Input(
  schema: Schema_Input
): graphql.InputObjectTypeDefinitionNode {
  return {
    kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
    name: toGraphql_Name(schema.name),
    fields: schema.fields.map((field) => ({
      kind: Kind.INPUT_VALUE_DEFINITION,
      name: toGraphql_Name(field.name),
      type: toGraphql_Nullable_If(
        field.nullable,
        toGraphql_NamedType(field.type)
      ),
      description: toGraphql_Description(field.description),
    })),
    description: toGraphql_Description(schema.description),
  };
}

export function toGraphQL(schema: Schema_Index): graphql.DocumentNode {
  return {
    kind: Kind.DOCUMENT,
    definitions: Object.values(schema.types).map((type) => {
      switch (type._structype) {
        case "record":
          return toGraphql_from_Schema_Record(type);

        case "interface":
          return toGraphql_from_Schema_Interface(type);

        case "enum":
          return toGraphql_from_Schema_Enum(type);

        case "union":
          return toGraphql_from_Schema_Union(type);

        case "input":
          return toGraphql_from_Schema_Input(type);

        case "scalar":
          return {
            kind: Kind.SCALAR_TYPE_DEFINITION,
            name: toGraphql_Name(type.name),
            description: toGraphql_Description(type.description),
          };

        default:
          // @ts-expect-error type._structype is never
          throw new Error(`Unsupported type: ${type._structype}`);
      }
    }),
  };
}

export function toGraphqlSchema(schema: Schema_Index) {
  return graphql.buildASTSchema(toGraphQL(schema));
}
