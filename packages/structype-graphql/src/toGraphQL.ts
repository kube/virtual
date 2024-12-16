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
    kind: graphql.Kind.NAMED_TYPE,
    name: { kind: graphql.Kind.NAME, value: typeName },
  };
}

function toGraphql_Description(description: string | undefined) {
  return description
    ? { kind: graphql.Kind.STRING as const, value: description }
    : undefined;
}

function nullableIf<T extends graphql.TypeNode>(
  condition: boolean | undefined,
  type: T
) {
  return condition ? type : { kind: graphql.Kind.NON_NULL_TYPE as const, type };
}

function toGraphql_from_Schema_Record_Field(
  schemaField: Schema_Record["fields"][number]
): graphql.FieldDefinitionNode {
  // Array

  if (schemaField.type._structype === "array") {
    return {
      kind: graphql.Kind.FIELD_DEFINITION,
      name: { kind: graphql.Kind.NAME, value: schemaField.name },
      type: nullableIf(
        schemaField.nullable,
        toGraphql_from_Schema_Array(schemaField.type)
      ),
      arguments: schemaField.args?.map((arg) => {
        return {
          kind: graphql.Kind.INPUT_VALUE_DEFINITION,
          name: { kind: graphql.Kind.NAME, value: arg.name },
          type: nullableIf(arg.nullable, toGraphql_NamedType(arg.type)),
          description: toGraphql_Description(arg.description),
        };
      }),
      description: toGraphql_Description(schemaField.description),
    };
  }

  // Named Type

  return {
    kind: graphql.Kind.FIELD_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schemaField.name },
    type: nullableIf(
      schemaField.nullable,
      toGraphql_NamedType(schemaField.type)
    ),
    arguments: schemaField.args?.map((arg) => ({
      kind: graphql.Kind.INPUT_VALUE_DEFINITION,
      name: { kind: graphql.Kind.NAME, value: arg.name },
      type: nullableIf(arg.nullable, toGraphql_NamedType(arg.type)),
      description: toGraphql_Description(arg.description),
    })),
    description: toGraphql_Description(schemaField.description),
  };
}

function toGraphql_from_Schema_Array(
  schema: Schema_Array
): graphql.ListTypeNode {
  return {
    kind: graphql.Kind.LIST_TYPE,
    type: nullableIf(schema.nullableItems, toGraphql_NamedType(schema.item)),
  };
}

function toGraphql_from_Schema_Record(
  schema: Schema_Record
): graphql.ObjectTypeDefinitionNode {
  return {
    kind: graphql.Kind.OBJECT_TYPE_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schema.name },
    fields: schema.fields.map(toGraphql_from_Schema_Record_Field),
    description: toGraphql_Description(schema.description),
    interfaces: schema.implements?.map(toGraphql_NamedType),
  };
}

function toGraphql_from_Schema_Interface(
  schema: Schema_Interface
): graphql.InterfaceTypeDefinitionNode {
  return {
    kind: graphql.Kind.INTERFACE_TYPE_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schema.name },
    fields: schema.fields.map(toGraphql_from_Schema_Record_Field),
    description: toGraphql_Description(schema.description),
  };
}

function toGraphql_from_Schema_Enum(
  schema: Schema_Enum
): graphql.EnumTypeDefinitionNode {
  return {
    kind: graphql.Kind.ENUM_TYPE_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schema.name },
    values: schema.values.map((value) => ({
      kind: graphql.Kind.ENUM_VALUE_DEFINITION,
      name: { kind: graphql.Kind.NAME, value },
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
    kind: graphql.Kind.UNION_TYPE_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schema.name },
    types: schema.types.map(toGraphql_NamedType),
    description: toGraphql_Description(schema.description),
  };
}

function toGraphql_from_Schema_Input(
  schema: Schema_Input
): graphql.InputObjectTypeDefinitionNode {
  return {
    kind: graphql.Kind.INPUT_OBJECT_TYPE_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schema.name },
    fields: schema.fields.map((field) => ({
      kind: graphql.Kind.INPUT_VALUE_DEFINITION,
      name: { kind: graphql.Kind.NAME, value: field.name },
      type: nullableIf(field.nullable, toGraphql_NamedType(field.type)),
      description: toGraphql_Description(field.description),
    })),
    description: toGraphql_Description(schema.description),
  };
}

export function toGraphQL(schema: Schema_Index): graphql.DocumentNode {
  return {
    kind: graphql.Kind.DOCUMENT,
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

        default:
          throw new Error(`Unsupported type: ${type._structype}`);
      }
    }),
  };
}

export function toGraphqlSchema(schema: Schema_Index) {
  return graphql.buildASTSchema(toGraphQL(schema));
}
