import { Schema_Index } from "@kube/structype";
import { describe, test } from "vitest";

import type { ResolversFromSchemaIndex } from "./ResolversFromSchemaIndex";

describe("First test", () => {
  // GIVEN
  const schema = {
    _structype: "index",
    types: {
      Restaurant: {
        _structype: "record",
        name: "Restaurant",
        fields: [
          { name: "id", type: { _structype: "string" } },
          { name: "name", type: { _structype: "string" } },
          { name: "seats", type: { _structype: "number" } },
        ],
      },
    },
  } as const satisfies Schema_Index;

  type Mapping = {
    Restaurant: { id: string; name: string; seats: number };
  };

  // WHEN
  type Resolvers = ResolversFromSchemaIndex<typeof schema, Mapping>;

  test("works", () => {
    // THEN
    const _x: Resolvers = {
      Restaurant: {
        id: () => "4242",
        name: () => "Hello",
        seats: () => 4242,
      },
    };
  });

  test("can be partial", () => {
    // THEN
    const _x: Resolvers = {
      Restaurant: {
        id: () => "4242",
        name: () => "Hello",
      },
    };
  });
});
