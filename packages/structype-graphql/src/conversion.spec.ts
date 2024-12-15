import { Schema_Index } from "@kube/structype";
import * as graphql from "graphql";
import { describe, expect, test } from "vitest";
import { toGraphqlSchema } from "./toGraphQL";
import { toStructype } from "./toStructype";

function gql(schema: string) {
  return graphql.printSchema(graphql.buildASTSchema(graphql.parse(schema)));
}

const CASES = [
  [
    "Simple type",
    gql(`
      type Person {
        name: String!
        age: Int!
      }
    `),
    {
      _structype: "index",
      types: {
        Person: {
          _structype: "record",
          name: "Person",
          fields: [
            { name: "name", type: { _structype: "string" } },
            { name: "age", type: { _structype: "number", int: true } },
          ],
        },
      },
    },
  ],
  [
    "support comments",
    gql(`
      type Person {
        """The person's name"""
        name: String!
        """The person's age"""
        age: Int!
      }
    `),
    {
      _structype: "index",
      types: {
        Person: {
          _structype: "record",
          name: "Person",
          fields: [
            {
              name: "name",
              description: "The person's name",
              type: { _structype: "string" },
            },
            {
              name: "age",
              description: "The person's age",
              type: { _structype: "number", int: true },
            },
          ],
        },
      },
    },
  ],
  [
    "supports ID",
    gql(`
      type Person {
        id: ID!
      }
    `),
    {
      _structype: "index",
      types: {
        Person: {
          _structype: "record",
          name: "Person",
          fields: [{ name: "id", type: { _structype: "id" } }],
        },
      },
    },
  ],
  [
    "supports boolean",
    gql(`
      type Person {
        isStudent: Boolean!
      }
    `),
    {
      _structype: "index",
      types: {
        Person: {
          _structype: "record",
          name: "Person",
          fields: [{ name: "isStudent", type: { _structype: "boolean" } }],
        },
      },
    },
  ],
  [
    "supports lists",
    gql(`
      type Person {
        friends: [String!]!
      }
    `),
    {
      _structype: "index",
      types: {
        Person: {
          _structype: "record",
          name: "Person",
          fields: [
            {
              name: "friends",
              type: { _structype: "array", item: { _structype: "string" } },
            },
          ],
        },
      },
    },
  ],
  [
    "supports nullable",
    gql(`
      type Person {
        name: String
      }
    `),
    {
      _structype: "index",
      types: {
        Person: {
          _structype: "record",
          name: "Person",
          fields: [
            { name: "name", nullable: true, type: { _structype: "string" } },
          ],
        },
      },
    },
  ],
  [
    "supports nested types",
    gql(`
      type Person {
        name: String!
        address: Address!
      }

      type Address {
        street: String!
        city: String!
      }
    `),
    {
      _structype: "index",
      types: {
        Person: {
          _structype: "record",
          name: "Person",
          fields: [
            { name: "name", type: { _structype: "string" } },
            {
              name: "address",
              type: { _structype: "ref_named", ref: "Address" },
            },
          ],
        },
        Address: {
          _structype: "record",
          name: "Address",
          fields: [
            { name: "street", type: { _structype: "string" } },
            { name: "city", type: { _structype: "string" } },
          ],
        },
      },
    },
  ],
  [
    "supports circular types",
    gql(`
      type Person {
        name: String!
        friends: [Person!]!
      }
    `),
    {
      _structype: "index",
      types: {
        Person: {
          _structype: "record",
          name: "Person",
          fields: [
            { name: "name", type: { _structype: "string" } },
            {
              name: "friends",
              type: {
                _structype: "array",
                item: { _structype: "ref_named", ref: "Person" },
              },
            },
          ],
        },
      },
    },
  ],
  [
    "supports enums",
    gql(`
      enum Role {
        ADMIN
        USER
      }

      type Person {
        role: Role!
      }
    `),
    {
      _structype: "index",
      types: {
        Role: {
          _structype: "enum",
          name: "Role",
          values: ["ADMIN", "USER"],
        },
        Person: {
          _structype: "record",
          name: "Person",
          fields: [
            { name: "role", type: { _structype: "ref_named", ref: "Role" } },
          ],
        },
      },
    },
  ],
  [
    "supports interfaces",
    gql(`
      interface Named {
        name: String!
      }

      type Person implements Named {
        name: String!
        age: Int!
      }
    `),
    {
      _structype: "index",
      types: {
        Named: {
          _structype: "interface",
          name: "Named",
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
        Person: {
          _structype: "record",
          name: "Person",
          implements: [{ _structype: "ref_named", ref: "Named" }],
          fields: [
            { name: "name", type: { _structype: "string" } },
            { name: "age", type: { _structype: "number", int: true } },
          ],
        },
      },
    },
  ],
  [
    "supports multiple interfaces",
    gql(`
      interface Named {
        name: String!
      }

      interface Aged {
        age: Int!
      }

      type Person implements Named & Aged {
        name: String!
        age: Int!
      }
    `),
    {
      _structype: "index",
      types: {
        Named: {
          _structype: "interface",
          name: "Named",
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
        Aged: {
          _structype: "interface",
          name: "Aged",
          fields: [{ name: "age", type: { _structype: "number", int: true } }],
        },
        Person: {
          _structype: "record",
          name: "Person",
          implements: [
            { _structype: "ref_named", ref: "Named" },
            { _structype: "ref_named", ref: "Aged" },
          ],
          fields: [
            { name: "name", type: { _structype: "string" } },
            { name: "age", type: { _structype: "number", int: true } },
          ],
        },
      },
    },
  ],
  [
    "supports unions",
    gql(`
      type Dog {
        name: String!
      }

      type Cat {
        name: String!
      }

      union Pet = Dog | Cat

      type Person {
        pet: Pet!
      }
    `),
    {
      _structype: "index",
      types: {
        Dog: {
          _structype: "record",
          name: "Dog",
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
        Cat: {
          _structype: "record",
          name: "Cat",
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
        Pet: {
          _structype: "union",
          name: "Pet",
          types: [
            { _structype: "ref_named", ref: "Dog" },
            { _structype: "ref_named", ref: "Cat" },
          ],
        },
        Person: {
          _structype: "record",
          name: "Person",
          fields: [
            { name: "pet", type: { _structype: "ref_named", ref: "Pet" } },
          ],
        },
      },
    },
  ],
  [
    "supports functions",
    gql(`
      type Query {
        hello(name: String!): String!
      }
    `),
    {
      _structype: "index",
      types: {
        Query: {
          _structype: "record",
          name: "Query",
          fields: [
            {
              name: "hello",
              args: [{ name: "name", type: { _structype: "string" } }],
              type: { _structype: "string" },
            },
          ],
        },
      },
    },
  ],
  [
    "supports input types",
    gql(`
      input PersonInput {
        name: String!
        age: Int
      }

      type Query {
        person(input: PersonInput!): Person!
      }

      type Person {
        name: String!
        age: Int!
      }
    `),
    {
      _structype: "index",
      types: {
        PersonInput: {
          _structype: "input",
          name: "PersonInput",
          fields: [
            { name: "name", type: { _structype: "string" } },
            {
              name: "age",
              type: { _structype: "number", int: true },
              nullable: true,
            },
          ],
        },
        Query: {
          _structype: "record",
          name: "Query",
          fields: [
            {
              name: "person",
              args: [
                {
                  name: "input",
                  type: { _structype: "ref_named", ref: "PersonInput" },
                },
              ],
              type: { _structype: "ref_named", ref: "Person" },
            },
          ],
        },
        Person: {
          _structype: "record",
          name: "Person",
          fields: [
            { name: "name", type: { _structype: "string" } },
            { name: "age", type: { _structype: "number", int: true } },
          ],
        },
      },
    },
  ],
] as const satisfies [string, string, Schema_Index][];

describe.each(CASES)("%s", (title, graphqlSchema, structypeSchema) => {
  test(`toGraphqlSchema: ${title}`, () => {
    const output = graphql.printSchema(toGraphqlSchema(structypeSchema));
    expect(output).toEqual(graphqlSchema);
  });
  test(`toStructype: ${title}`, () => {
    const output = toStructype(graphqlSchema);
    expect(output).toEqual(structypeSchema);
  });
});
