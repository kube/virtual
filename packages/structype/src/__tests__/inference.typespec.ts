import { Assert, IsExactType } from "typebolt";
import { Schema_Index } from "../Schema";
import { Infer_FromIndex } from "../inference";

// Simple type
{
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

  // WHEN
  type Restaurant = Infer_FromIndex<typeof schema, "Restaurant">;

  // THEN
  type Expected = {
    id: string;
    name: string;
    seats: number;
  };
  Assert<IsExactType<Restaurant, Expected>>();
}

// Type with nullable fields
{
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
          { name: "description", nullable: true, type: { _structype: "string" } },
        ],
      },
    },
  } as const satisfies Schema_Index;

  type Restaurant = Infer_FromIndex<typeof schema, "Restaurant">;

  type Expected = {
    id: string;
    name: string;
    seats: number;
    description: string | null;
  };

  Assert<IsExactType<Restaurant, Expected>>();
}

// Type with named references
{
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
      Customer: {
        _structype: "record",
        name: "Customer",
        fields: [
          { name: "id", type: { _structype: "string" } },
          { name: "name", type: { _structype: "string" } },
          { name: "email", type: { _structype: "string" } },
        ],
      },
      Reservation: {
        _structype: "record",
        name: "Reservation",
        fields: [
          { name: "id", type: { _structype: "string" } },
          { name: "restaurant", type: { _structype: "ref_named", ref: "Restaurant" } },
          { name: "customer", type: { _structype: "ref_named", ref: "Customer" } },
          { name: "date", type: { _structype: "string" } },
        ],
      },
    },
  } as const satisfies Schema_Index;

  type Reservation = Infer_FromIndex<typeof schema, "Reservation">;

  type Expected = {
    id: string;
    restaurant: {
      id: string;
      name: string;
      seats: number;
    };
    customer: {
      id: string;
      name: string;
      email: string;
    };
    date: string;
  };

  Assert<IsExactType<Reservation, Expected>>();
}

// Circular type
{
  const schema = {
    _structype: "index",
    types: {
      Person: {
        _structype: "record",
        name: "Person",
        fields: [
          { name: "name", type: { _structype: "string" } },
          { name: "parent", type: { _structype: "ref_named", ref: "Person" } },
        ],
      },
    },
  } as const satisfies Schema_Index;

  type Person = Infer_FromIndex<typeof schema, "Person">;

  type Expected = {
    name: string;
    parent: Expected;
  };

  Assert<IsExactType<Person, Expected>>();
}
