import { Assert, IsExactType } from "typebolt";
import { describe, test } from "vitest";
import { Schema_Index } from "../Schema";
import { Infer_FromIndex } from "../inference";

test("Simple type", () => {
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
});

test("Type with nullable fields", () => {
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
          {
            name: "description",
            nullable: true,
            type: { _structype: "string" },
          },
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
});

test("Type with named references", () => {
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
          {
            name: "restaurant",
            type: { _structype: "ref_named", ref: "Restaurant" },
          },
          {
            name: "customer",
            type: { _structype: "ref_named", ref: "Customer" },
          },
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
});

test("Circular type", () => {
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
});

describe("Scalar Mapping", () => {
  describe("when requesting Scalar directly", () => {
    // GIVEN
    const schema = {
      _structype: "index",
      types: {
        DateTime: {
          _structype: "scalar",
          name: "DateTime",
        },
      },
    } as const satisfies Schema_Index;

    test("when no mapping", () => {
      // GIVEN
      type Scalars = {};

      // WHEN
      type DateTime = Infer_FromIndex<typeof schema, "DateTime", {}, Scalars>;

      // THEN
      type Expected = any;
      Assert<IsExactType<DateTime, Expected>>();
    });

    test("when mapping is provided", () => {
      // GIVEN
      type Scalars = {
        DateTime: Date;
      };

      // WHEN
      type DateTime = Infer_FromIndex<typeof schema, "DateTime", {}, Scalars>;

      // THEN
      type Expected = Date;
      Assert<IsExactType<DateTime, Expected>>();
    });
  });

  test("when Scalar is nested in Record", () => {
    // GIVEN
    const schema = {
      _structype: "index",
      types: {
        DateTime: {
          _structype: "scalar",
          name: "DateTime",
        },
        Restaurant: {
          _structype: "record",
          name: "Restaurant",
          fields: [
            { name: "id", type: { _structype: "string" } },
            { name: "name", type: { _structype: "string" } },
            {
              name: "createdAt",
              type: { _structype: "ref_named", ref: "DateTime" },
            },
          ],
        },
      },
    } as const satisfies Schema_Index;

    test("when no mapping", () => {
      // GIVEN
      type Scalars = {};

      // WHEN
      type Restaurant = Infer_FromIndex<
        typeof schema,
        "Restaurant",
        {},
        Scalars
      >;

      // THEN
      type Expected = {
        id: string;
        name: string;
        createdAt: any;
      };
      Assert<IsExactType<Restaurant, Expected>>();
    });

    test("when mapping is provided", () => {
      // GIVEN
      type Scalars = {
        DateTime: Date;
      };

      // WHEN
      type Restaurant = Infer_FromIndex<
        typeof schema,
        "Restaurant",
        {},
        Scalars
      >;

      // THEN
      type Expected = {
        id: string;
        name: string;
        createdAt: Date;
      };
      Assert<IsExactType<Restaurant, Expected>>();
    });
  });
});

describe("Type Mapping", () => {
  describe("when requesting type directly", () => {
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
          ],
        },
      },
    } as const satisfies Schema_Index;

    test("when no mapping", () => {
      // GIVEN
      type Types = {};

      // WHEN
      type Restaurant = Infer_FromIndex<typeof schema, "Restaurant", Types>;

      // THEN
      type Expected = {
        id: string;
        name: string;
      };
      Assert<IsExactType<Restaurant, Expected>>();
    });

    test("when mapping is provided", () => {
      // GIVEN
      type Types = {
        Restaurant: "SOME_CUSTOM_TYPE";
      };

      // WHEN
      type Restaurant = Infer_FromIndex<typeof schema, "Restaurant", Types>;

      // THEN
      type Expected = Types["Restaurant"];
      Assert<IsExactType<Restaurant, Expected>>();
    });
  });

  describe("when type is nested in Record", () => {
    // GIVEN
    const schema = {
      _structype: "index",
      types: {
        User: {
          _structype: "record",
          name: "User",
          fields: [
            { name: "id", type: { _structype: "string" } },
            { name: "name", type: { _structype: "string" } },
          ],
        },
        Restaurant: {
          _structype: "record",
          name: "Restaurant",
          fields: [
            { name: "id", type: { _structype: "string" } },
            { name: "name", type: { _structype: "string" } },
            {
              name: "owner",
              type: { _structype: "ref_named", ref: "User" },
            },
          ],
        },
      },
    } as const satisfies Schema_Index;

    test("when no mapping", () => {
      // GIVEN
      type Types = {};

      // WHEN
      type Restaurant = Infer_FromIndex<typeof schema, "Restaurant", Types>;

      // THEN
      type Expected = {
        id: string;
        name: string;
        owner: any;
      };
      Assert<IsExactType<Restaurant, Expected>>();
    });

    test("when mapping is provided", () => {
      // GIVEN
      type Types = {
        User: "SOME_CUSTOM_TYPE";
      };

      // WHEN
      type Restaurant = Infer_FromIndex<typeof schema, "Restaurant", Types>;

      // THEN
      type Expected = {
        id: string;
        name: string;
        owner: "SOME_CUSTOM_TYPE";
      };
      Assert<IsExactType<Restaurant, Expected>>();
    });
  });
});
