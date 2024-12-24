import { Schema_Index } from "@kube/structype";
import { Assert, IsExactType } from "typebolt";
import { Input } from "../Input";

// Input.store should only accept Interfaces and Records
{
  const schema = {
    _structype: "index",
    types: {
      Animal: {
        _structype: "interface",
        name: "Animal",
        fields: [{ name: "name", type: { _structype: "string" } }],
      },
      Dog: {
        _structype: "record",
        name: "Dog",
        fields: [{ name: "name", type: { _structype: "string" } }],
      },
      Cat: {
        _structype: "enum",
        name: "Cat",
        values: ["dead", "alive"],
      },
    },
  } as const satisfies Schema_Index;

  type KeysOfInputStore = keyof Input<typeof schema>["store"];
  type Expected = "Animal" | "Dog";

  Assert<IsExactType<KeysOfInputStore, Expected>>();
}

// Input.store should accept an array with correct optional input (collections)
{
  const schema = {
    _structype: "index",
    types: {
      Dog: {
        _structype: "record",
        name: "Dog",
        fields: [{ name: "name", type: { _structype: "string" } }],
      },
    },
  } as const satisfies Schema_Index;

  type Input_store_Dog = Input<typeof schema>["store"]["Dog"];

  type Expected = Array<{
    __typename?: "Dog";
    name?: string;
  }>;

  Assert<IsExactType<Input_store_Dog, Expected>>();
}

// Input.store should require __typename of a derived type in case of Interface
{
  // With single interface
  {
    const schema = {
      _structype: "index",
      types: {
        Animal: {
          _structype: "interface",
          name: "Animal",
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
        Dog: {
          _structype: "record",
          name: "Dog",
          implements: [{ _structype: "ref_named", ref: "Animal" }],
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
        Cat: {
          _structype: "record",
          name: "Cat",
          implements: [{ _structype: "ref_named", ref: "Animal" }],
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
      },
    } as const satisfies Schema_Index;

    type Input_store_Animal = Input<typeof schema>["store"]["Animal"];

    type Expected = Array<{
      __typename: "Dog" | "Cat";
      name?: string;
    }>;

    Assert<IsExactType<Input_store_Animal, Expected>>();
  }

  // With multiple interfaces
  {
    const schema = {
      _structype: "index",
      types: {
        Animal: {
          _structype: "interface",
          name: "Animal",
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
        Bird: {
          _structype: "interface",
          name: "Bird",
          fields: [{ name: "wings", type: { _structype: "number" } }],
        },
        Dog: {
          _structype: "record",
          name: "Dog",
          implements: [{ _structype: "ref_named", ref: "Animal" }],
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
        Cat: {
          _structype: "record",
          name: "Cat",
          implements: [{ _structype: "ref_named", ref: "Animal" }],
          fields: [{ name: "name", type: { _structype: "string" } }],
        },
        Parrot: {
          _structype: "record",
          name: "Parrot",
          implements: [
            { _structype: "ref_named", ref: "Animal" },
            { _structype: "ref_named", ref: "Bird" },
          ],
          fields: [
            { name: "name", type: { _structype: "string" } },
            { name: "wings", type: { _structype: "number" } },
          ],
        },
      },
    } as const satisfies Schema_Index;

    type Input_store_Animal = Input<typeof schema>["store"]["Animal"];
    type Input_store_Parrot = Input<typeof schema>["store"]["Parrot"];

    type Expected_Animal = Array<{
      __typename: "Dog" | "Cat" | "Parrot";
      name?: string;
    }>;

    type Expected_Parrot = Array<{
      __typename?: "Parrot";
      name?: string;
      wings?: number;
    }>;

    Assert<IsExactType<Input_store_Animal, Expected_Animal>>();
    Assert<IsExactType<Input_store_Parrot, Expected_Parrot>>();
  }
}
