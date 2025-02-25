// import { type } from "@kube/structype";

import {
  Schema_Array,
  Schema_Enum,
  Schema_Index,
  Schema_Interface,
  Schema_Record,
  Schema_Union,
} from "@kube/structype";
import * as graphql from "graphql";

function toStructype_from_EnumTypeDefinition(
  node: graphql.EnumTypeDefinitionNode
) {
  if (!node.values || node.values.length === 0) {
    throw new Error("Enum must have at least one value");
  }
  return {
    _structype: "enum",
    name: node.name.value,
    values: node.values.map((value) => value.name.value),
  } as const satisfies Schema_Enum;
}

function toStructype_from_NamedType(node: graphql.NamedTypeNode) {
  switch (node.name.value) {
    case "ID":
      return { _structype: "id" } as const;

    case "String":
      return { _structype: "string" } as const;

    case "Boolean":
      return { _structype: "boolean" } as const;

    case "Int":
    case "Float":
      return { _structype: "number", int: node.name.value === "Int" } as const;

    default:
      // TODO: Check if reference exists?
      return { _structype: "ref_named", ref: node.name.value } as const;
  }
}

function toStructype_from_TypeNode(node: graphql.TypeNode) {
  switch (node.kind) {
    case "NamedType":
      return toStructype_from_NamedType(node);

    case "ListType":
      return toStructype_from_ListType(node);

    case "NonNullType":
      // Do not allow NonNullType here, they should be handled upstream (in FieldDefinition)
      throw new Error("Unexpected NonNullType");

    default:
      throw new Error(`Unsupported kind: ${node.kind}`);
  }
}

function toStructype_from_Scalar(node: graphql.ScalarTypeDefinitionNode) {
  return {
    _structype: "scalar",
    name: node.name.value,
  } as const;
}

function toStructype_from_ListType(node: graphql.ListTypeNode): Schema_Array {
  const nullableItems = node.type.kind !== "NonNullType";
  const typeNode = nullableItems ? node.type : node.type.type;
  const item = toStructype_from_TypeNode(typeNode);

  // TODO: Check if ID is allowed in a list?
  if (item._structype === "id") throw new Error("ID cannot be used in a list");

  return {
    _structype: "array",
    item,
    ...(nullableItems && { nullableItems }),
  } as const;
}

function toStructype_from_FieldDefinition(node: graphql.FieldDefinitionNode) {
  const nullable = node.type.kind !== "NonNullType";
  const typeNode = nullable ? node.type : node.type.type;
  const description = node.description?.value;

  const args = node.arguments?.length
    ? node.arguments.map((node) => {
        const nullable = node.type.kind !== "NonNullType";
        const typeNode = nullable ? node.type : node.type.type;
        return {
          name: node.name.value,
          ...(description && { description }),
          ...(nullable && { nullable }),
          type: toStructype_from_TypeNode(typeNode),
        } as const satisfies NonNullable<
          Schema_Record["fields"][number]["args"]
        >[number];
      })
    : undefined;

  return {
    name: node.name.value,
    ...(description && { description }),
    ...(nullable && { nullable }),
    ...(args && { args }),
    type: toStructype_from_TypeNode(typeNode),
  } as const satisfies Schema_Record["fields"][number];
}

function toStructype_from_InterfaceTypeDefinition(
  node: graphql.InterfaceTypeDefinitionNode
): Schema_Interface {
  if (!node.fields || node.fields.length === 0) {
    throw new Error("Object must have at least one field");
  }

  return {
    _structype: "interface",
    name: node.name.value,
    fields: node.fields.map(toStructype_from_FieldDefinition),
  } as const;
}

function toStructype_from_ObjectTypeDefinition(
  node: graphql.ObjectTypeDefinitionNode
): Schema_Record {
  if (!node.fields || node.fields.length === 0) {
    throw new Error("Object must have at least one field");
  }

  const implements_ = node.interfaces?.length
    ? node.interfaces?.map((node) => {
        if (node.kind !== "NamedType") {
          throw new Error("Unexpected kind");
        }
        return { _structype: "ref_named", ref: node.name.value } as const;
      })
    : undefined;

  return {
    _structype: "record",
    name: node.name.value,
    ...(implements_ && { implements: implements_ }),
    fields: node.fields.map(toStructype_from_FieldDefinition),
  };
}

function toStructype_from_UnionTypeDefinition(
  node: graphql.UnionTypeDefinitionNode
): Schema_Union {
  const description = node.description?.value;

  if (!node.types || node.types.length === 0) {
    throw new Error("Union must have at least one type");
  }

  return {
    _structype: "union",
    name: node.name.value,
    ...(description && { description }),
    types: node.types?.map((node) => {
      if (node.kind !== "NamedType") {
        throw new Error("Unexpected kind");
      }
      return { _structype: "ref_named", ref: node.name.value } as const;
    }),
  };
}

function toStructype_from_InputFieldDefinition(
  node: graphql.InputValueDefinitionNode
) {
  const nullable = node.type.kind !== "NonNullType";
  const typeNode = nullable ? node.type : node.type.type;
  const description = node.description?.value;

  return {
    name: node.name.value,
    ...(description && { description }),
    ...(nullable && { nullable }),
    type: toStructype_from_TypeNode(typeNode),
  } as const satisfies Schema_Record["fields"][number];
}

function toStructype_from_InputObjectTypeDefinition(
  node: graphql.InputObjectTypeDefinitionNode
) {
  if (!node.fields || node.fields.length === 0) {
    throw new Error("Input Object must have at least one field");
  }

  return {
    _structype: "input",
    name: node.name.value,
    fields: node.fields.map(toStructype_from_InputFieldDefinition),
  };
}

export function toStructype(gqlContent: string): Schema_Index {
  const ast = graphql.parse(gqlContent);
  const typeDefinitions = ast.definitions.filter(graphql.isTypeDefinitionNode);

  const types = typeDefinitions.map((node) => {
    switch (node.kind) {
      case "ObjectTypeDefinition":
        return toStructype_from_ObjectTypeDefinition(node);

      case "InterfaceTypeDefinition":
        return toStructype_from_InterfaceTypeDefinition(node);

      case "EnumTypeDefinition":
        return toStructype_from_EnumTypeDefinition(node);

      case "UnionTypeDefinition":
        return toStructype_from_UnionTypeDefinition(node);

      case "InputObjectTypeDefinition":
        return toStructype_from_InputObjectTypeDefinition(node);

      case "ScalarTypeDefinition":
        return toStructype_from_Scalar(node);

      default:
        throw new Error(`Unsupported kind: ${node.kind}`);
    }
  });

  return {
    _structype: "index",
    types: Object.fromEntries(types.map((type) => [type.name, type])),
  };
}
