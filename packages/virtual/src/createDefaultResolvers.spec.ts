import { Schema_Index } from "@kube/structype";
import { test } from "vitest";
import { createDefaultResolvers } from "./createDefaultResolvers";

test("createDefaultResolvers", async ({ expect }) => {
  const schema = {
    _structype: "index",
    types: {
      ComputerBrand: {
        _structype: "enum",
        name: "ComputerBrand",
        values: ["Apple", "Dell", "HP"],
      },
      User: {
        _structype: "record",
        name: "User",
        fields: [
          {
            name: "id",
            type: { _structype: "id" },
          },
          {
            name: "name",
            type: { _structype: "string" },
          },
          {
            name: "age",
            type: { _structype: "number" },
          },
          {
            name: "computer_brand",
            type: { _structype: "ref_named", ref: "ComputerBrand" },
          },
          {
            name: "somethingElse",
            nullable: true,
            type: { _structype: "boolean" },
          },
        ],
      },
    },
  } satisfies Schema_Index;

  const resolvers = createDefaultResolvers(schema);

  expect(resolvers).toEqual({
    User: {
      id: expect.any(Function),
      name: expect.any(Function),
      age: expect.any(Function),
      computer_brand: expect.any(Function),
      somethingElse: expect.any(Function),
    },
  });

  expect(resolvers.User.id()).toBeTypeOf("string");
  expect(resolvers.User.name()).toBeTypeOf("string");
  expect(resolvers.User.age()).toBeTypeOf("number");
  expect(resolvers.User.computer_brand()).toBe("Apple");
  expect(resolvers.User.somethingElse()).toBe(null);
});
