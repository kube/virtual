import { Schema_Index } from "@kube/structype";
import { expect, test } from "vitest";
import { toStructype } from "./toStructype";

test("Simple type", () => {
  // GIVEN
  const input = `
    type Person {
      name: String!
      age: Int!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
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
  } as const satisfies Schema_Index;


  expect(result).toEqual(expected);
});

test('support comments', () => {
  // GIVEN
  const input = `
    type Person {
      """The person's name"""
      name: String!
      """The person's age"""
      age: Int!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      Person: {
        _structype: "record",
        name: "Person",
        fields: [
          { name: "name", description: "The person's name", type: { _structype: "string" } },
          { name: "age", description: "The person's age", type: { _structype: "number", int: true } },
        ],
      },
    },
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
})

test("supports ID", () => {
  // GIVEN
  const input = `
    type Person {
      id: ID!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      Person: {
        _structype: "record",
        name: "Person",
        fields: [
          { name: "id", type: { _structype: "id" } },
        ],
      },
    },
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
});

test('supports boolean', () => {
  // GIVEN
  const input = `
    type Person {
      isStudent: Boolean!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      Person: {
        _structype: "record",
        name: "Person",
        fields: [
          { name: "isStudent", type: { _structype: "boolean" } },
        ]
      },
    },
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
})

test("supports lists", () => {
  // GIVEN
  const input = `
    type Person {
      friends: [String!]!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      Person: {
        _structype: "record",
        name: "Person",
        fields: [
          {
            name: "friends",
            type: { _structype: "array", item: { _structype: "string" } }
          },
        ],
      },
    },
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
});

test("supports nullable", () => {
  // GIVEN
  const input = `
    type Person {
      name: String
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
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
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
});

test("supports nested types", () => {
  // GIVEN
  const input = `
    type Person {
      name: String!
      address: Address!
    }

    type Address {
      street: String!
      city: String!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      Person: {
        _structype: "record",
        name: "Person",
        fields: [
          { name: "name", type: { _structype: "string" } },
          { name: "address", type: { _structype: "ref_named", ref: "Address" } },
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
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
});

test("supports circular types", () => {
  // GIVEN
  const input = `
    type Person {
      name: String!
      friends: [Person!]!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      Person: {
        _structype: "record",
        name: "Person",
        fields: [
          { name: "name", type: { _structype: "string" } },
          {
            name: "friends",
            type: { _structype: "array", item: { _structype: "ref_named", ref: "Person" } }
          },
        ],
      },
    },
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
})

test("supports enums", () => {
  // GIVEN
  const input = `
    enum Role {
      ADMIN
      USER
    }

    type Person {
      role: Role!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
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
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
});

test("supports interfaces", () => {
  // GIVEN
  const input = `
    interface Named {
      name: String!
    }

    type Person implements Named {
      name: String!
      age: Int!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      Named: {
        _structype: "interface",
        name: "Named",
        fields: [
          { name: "name", type: { _structype: "string" } },
        ],
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
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
});

test("supports multiple interfaces", () => {
  // GIVEN
  const input = `
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
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      Named: {
        _structype: "interface",
        name: "Named",
        fields: [
          { name: "name", type: { _structype: "string" } },
        ],
      },
      Aged: {
        _structype: "interface",
        name: "Aged",
        fields: [
          { name: "age", type: { _structype: "number", int: true } },
        ],
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
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
});

test("supports unions", () => {
  // GIVEN
  const input = `
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
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      Dog: {
        _structype: "record",
        name: "Dog",
        fields: [
          { name: "name", type: { _structype: "string" } },
        ],
      },
      Cat: {
        _structype: "record",
        name: "Cat",
        fields: [
          { name: "name", type: { _structype: "string" } },
        ],
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
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
});

test("supports functions", () => {
  // GIVEN
  const input = `
    type Query {
      hello(name: String!): String!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
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
  }

  expect(result).toEqual(expected);
})

test("supports input types", () => {
  // GIVEN
  const input = `
    input PersonInput {
      name: String!
      age: Int!
    }

    type Query {
      person(input: PersonInput!): Person!
    }

    type Person {
      name: String!
      age: Int!
    }
  `;

  // WHEN
  const result = toStructype(input);

  // THEN
  const expected = {
    _structype: "index",
    types: {
      PersonInput: {
        _structype: "input",
        name: "PersonInput",
        fields: [
          { name: "name", type: { _structype: "string" } },
          { name: "age", type: { _structype: "number", int: true } },
        ],
      },
      Query: {
        _structype: "record",
        name: "Query",
        fields: [
          {
            name: "person",
            args: [{ name: "input", type: { _structype: "ref_named", ref: "PersonInput" } }],
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
  } as const satisfies Schema_Index;

  expect(result).toEqual(expected);
});
