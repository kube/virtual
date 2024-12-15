import {
  Schema_Array,
  Schema_Enum,
  Schema_Index,
  Schema_Input,
  Schema_Interface,
  Schema_Record,
  Schema_Union,
} from "@kube/structype";
import * as graphql from "graphql";

function toGraphql_from_Schema_Record_Field(
  schemaField: Schema_Record["fields"][number]
): graphql.FieldDefinitionNode {
  if (schemaField.type._structype === "array") {
    return {
      kind: graphql.Kind.FIELD_DEFINITION,
      name: { kind: graphql.Kind.NAME, value: schemaField.name },
      type: schemaField.nullable
        ? toGraphql_from_Schema_Array(schemaField.type)
        : {
            kind: graphql.Kind.NON_NULL_TYPE,
            type: toGraphql_from_Schema_Array(schemaField.type),
          },
      arguments: schemaField.args?.map((arg) => {
        let type;

        switch (arg.type._structype) {
          case "string":
            type = "String";
            break;

          case "number":
            type = arg.type.int ? "Int" : "Float";
            break;

          case "id":
            type = "ID";
            break;

          case "boolean":
            type = "Boolean";
            break;

          case "ref_named":
            type = arg.type.ref;
            break;

          default:
            throw new Error(`Unsupported type: ${arg.type._structype}`);
        }

        return {
          kind: graphql.Kind.INPUT_VALUE_DEFINITION,
          name: { kind: graphql.Kind.NAME, value: arg.name },
          type: arg.nullable
            ? {
                kind: graphql.Kind.NAMED_TYPE,
                name: { kind: graphql.Kind.NAME, value: type },
              }
            : {
                kind: graphql.Kind.NON_NULL_TYPE,
                type: {
                  kind: graphql.Kind.NAMED_TYPE,
                  name: { kind: graphql.Kind.NAME, value: type },
                },
              },
          description: arg.description
            ? { kind: graphql.Kind.STRING, value: arg.description }
            : undefined,
        };
      }),
      description: schemaField.description
        ? { kind: graphql.Kind.STRING, value: schemaField.description }
        : undefined,
    };
  }

  // NamedType

  let schemaTypeName: string;

  switch (schemaField.type._structype) {
    case "string":
      schemaTypeName = "String";
      break;

    case "number":
      schemaTypeName = schemaField.type.int ? "Int" : "Float";
      break;

    case "id":
      schemaTypeName = "ID";
      break;

    case "boolean":
      schemaTypeName = "Boolean";
      break;

    case "ref_named":
      schemaTypeName = schemaField.type.ref;
      break;

    default:
      throw new Error(`Unsupported type: ${schemaField.type._structype}`);
  }

  const schemaFinalType: graphql.NamedTypeNode = {
    kind: graphql.Kind.NAMED_TYPE,
    name: {
      kind: graphql.Kind.NAME,
      value: schemaTypeName,
    },
  };

  return {
    kind: graphql.Kind.FIELD_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schemaField.name },
    type: schemaField.nullable
      ? schemaFinalType
      : {
          kind: graphql.Kind.NON_NULL_TYPE,
          type: schemaFinalType,
        },
    arguments: schemaField.args?.map((arg) => {
      let type;

      switch (arg.type._structype) {
        case "string":
          type = "String";
          break;

        case "number":
          type = arg.type.int ? "Int" : "Float";
          break;

        case "id":
          type = "ID";
          break;

        case "boolean":
          type = "Boolean";
          break;

        case "ref_named":
          type = arg.type.ref;
          break;

        default:
          throw new Error(`Unsupported type: ${arg.type._structype}`);
      }

      return {
        kind: graphql.Kind.INPUT_VALUE_DEFINITION,
        name: { kind: graphql.Kind.NAME, value: arg.name },
        type: arg.nullable
          ? {
              kind: graphql.Kind.NAMED_TYPE,
              name: { kind: graphql.Kind.NAME, value: type },
            }
          : {
              kind: graphql.Kind.NON_NULL_TYPE,
              type: {
                kind: graphql.Kind.NAMED_TYPE,
                name: { kind: graphql.Kind.NAME, value: type },
              },
            },
        description: arg.description
          ? { kind: graphql.Kind.STRING, value: arg.description }
          : undefined,
      };
    }),
    description: schemaField.description
      ? { kind: graphql.Kind.STRING, value: schemaField.description }
      : undefined,
  };
}

function toGraphql_from_Schema_Array(
  schema: Schema_Array
): graphql.ListTypeNode {
  let itemTypeName;

  switch (schema.item._structype) {
    case "ref_named":
      itemTypeName = schema.item.ref;
      break;

    case "string":
      itemTypeName = "String";
      break;

    case "number":
      itemTypeName = schema.item.int ? "Int" : "Float";
      break;

    case "boolean":
      itemTypeName = "Boolean";
      break;

    default:
      throw new Error(`Unsupported type: ${schema.item._structype}`);
  }

  const itemType = {
    kind: graphql.Kind.NAMED_TYPE,
    name: {
      kind: graphql.Kind.NAME,
      value: itemTypeName,
    },
  } as const;

  return {
    kind: graphql.Kind.LIST_TYPE,
    type: schema.nullableItems
      ? itemType
      : ({
          kind: graphql.Kind.NON_NULL_TYPE,
          type: itemType,
        } as const),
  };
}

function toGraphql_from_Schema_Record(
  schema: Schema_Record
): graphql.ObjectTypeDefinitionNode {
  return {
    kind: graphql.Kind.OBJECT_TYPE_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schema.name },
    fields: schema.fields.map(toGraphql_from_Schema_Record_Field),
    description: schema.description
      ? { kind: graphql.Kind.STRING, value: schema.description }
      : undefined,
    interfaces: schema.implements?.map((ref) => ({
      kind: graphql.Kind.NAMED_TYPE,
      name: { kind: graphql.Kind.NAME, value: ref.ref },
    })),
  };
}

function toGraphql_from_Schema_Interface(
  schema: Schema_Interface
): graphql.InterfaceTypeDefinitionNode {
  return {
    kind: graphql.Kind.INTERFACE_TYPE_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schema.name },
    fields: schema.fields.map(toGraphql_from_Schema_Record_Field),
    description: schema.description
      ? { kind: graphql.Kind.STRING, value: schema.description }
      : undefined,
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
    description: schema.description
      ? { kind: graphql.Kind.STRING, value: schema.description }
      : undefined,
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
    types: schema.types.map((type) => ({
      kind: graphql.Kind.NAMED_TYPE,
      name: { kind: graphql.Kind.NAME, value: type.ref },
    })),
    description: schema.description
      ? { kind: graphql.Kind.STRING, value: schema.description }
      : undefined,
  };
}

function toGraphql_from_Schema_Input(
  schema: Schema_Input
): graphql.InputObjectTypeDefinitionNode {
  return {
    kind: graphql.Kind.INPUT_OBJECT_TYPE_DEFINITION,
    name: { kind: graphql.Kind.NAME, value: schema.name },
    fields: schema.fields.map((field) => {
      let type;

      switch (field.type._structype) {
        case "string":
          type = "String";
          break;

        case "number":
          type = field.type.int ? "Int" : "Float";
          break;

        case "id":
          type = "ID";
          break;

        case "boolean":
          type = "Boolean";
          break;

        case "ref_named":
          type = field.type.ref;
          break;

        default:
          throw new Error(`Unsupported type: ${field.type._structype}`);
      }

      return {
        kind: graphql.Kind.INPUT_VALUE_DEFINITION,
        name: { kind: graphql.Kind.NAME, value: field.name },
        type: field.nullable
          ? {
              kind: graphql.Kind.NAMED_TYPE,
              name: { kind: graphql.Kind.NAME, value: type },
            }
          : {
              kind: graphql.Kind.NON_NULL_TYPE,
              type: {
                kind: graphql.Kind.NAMED_TYPE,
                name: { kind: graphql.Kind.NAME, value: type },
              },
            },
        description: field.description
          ? { kind: graphql.Kind.STRING, value: field.description }
          : undefined,
      };
    }),
    description: schema.description
      ? { kind: graphql.Kind.STRING, value: schema.description }
      : undefined,
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
