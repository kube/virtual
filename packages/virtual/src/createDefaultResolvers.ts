import { Schema, Schema_Index } from "@kube/structype";

export function getDefaultValueForSchema(
  schema: Schema,
  index: Schema_Index
): any {
  switch (schema._structype) {
    case "index": {
      throw new Error("Unexpected Schema_Index nested in Schema.");
    }
    // TODO: Refs can link to something else than a Record.
    // {} is the default value for a record.
    case "ref_named": {
      const refSchema = index.types[schema.ref];
      if (!refSchema) {
        throw new Error(`Ref not found in Schema_Index: ${schema.ref}`);
      }
      return getDefaultValueForSchema(refSchema, index);
    }
    case "ref_thunk": {
      const refSchema = schema.ref();
      // TODO: Fix RefThunk types
      return getDefaultValueForSchema(refSchema as Schema, index);
    }
    case "record": {
      return { __typename: schema.name };
    }
    case "array": {
      return [];
    }
    case "boolean": {
      return false;
    }
    case "number": {
      return schema.int ? 1.0 : 1.5;
    }
    case "string": {
      return "_";
    }
    case "id": {
      return "0";
    }
    case "enum": {
      return schema.values[0];
    }
    case "scalar": {
      return "scalar";
    }
    case "union": {
      const firstType = schema.types[0];
      if (!firstType) {
        throw new Error("Union type has no types.");
      }
      const firstTypeSchema = index.types[firstType.ref];
      if (!firstTypeSchema) {
        throw new Error(
          `Union type not found in Schema_Index: ${firstType.ref}`
        );
      }
      return getDefaultValueForSchema(firstTypeSchema, index);
    }

    case "input":
    case "interface":
    default: {
      throw new Error(`Unsupported schema type: (${schema._structype})`);
    }
  }
}

function createDefaultResolvers_Record(index: Schema_Index, name: string) {
  const recordSchema = index.types[name];

  if (!recordSchema) {
    throw new Error(`Type not found in Schema_Index: ${name}`);
  }
  if (recordSchema._structype !== "record") {
    throw new Error(
      `Expected record type, got ${recordSchema._structype} (name: ${name})`
    );
  }
  if (recordSchema.name !== name) {
    throw new Error(
      `Expected record type name to match, got ${recordSchema.name}`
    );
  }

  return Object.fromEntries(
    recordSchema.fields.map((field) => {
      if (field.nullable) {
        return [field.name, () => null];
      }
      return [field.name, () => getDefaultValueForSchema(field.type, index)];
    })
  );
}

export function createDefaultResolvers(schema: Schema_Index) {
  const types = Object.entries(schema.types);
  const defaultResolversEntries = types.map(([typeName, type]) => {
    switch (type._structype) {
      case "record": {
        return [typeName, createDefaultResolvers_Record(schema, typeName)];
      }

      case "enum": {
        // Do not put any resolvers for enums
        return [typeName, undefined];
      }
      case "scalar": {
        // Do not put any resolvers for scalars
        return [typeName, undefined];
      }
      case "union": {
        // Do not put any resolvers for unions
        return [typeName, undefined];
      }
      case "input":
      case "interface":
      default:
        throw new Error(`Unsupported type: ${type._structype}`);
    }
  });

  return Object.fromEntries(
    defaultResolversEntries.filter(([, value]) => value)
  );
}
