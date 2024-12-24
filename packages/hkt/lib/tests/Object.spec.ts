import { Assert, IsExactType } from "typebolt";
import { HKT } from "../HKT";
import { Object } from "../Object";

// Test: MapValues
{
  // GIVEN
  type Input = {
    a: { firstName: "John"; lastName: "Doe" };
    b: { firstName: "Jane"; lastName: "Doe" };
  };

  interface $Mapper extends HKT {
    return: `${this["A"]["firstName"]} ${this["A"]["lastName"]}`;
  }

  // WHEN
  type Result = Object.MapValues<Input, $Mapper>;

  // THEN
  Assert<IsExactType<Result["a"], "John Doe">>();
  Assert<IsExactType<Result["b"], "Jane Doe">>();
}

// Test: FromEntries
{
  // GIVEN
  type Input = [
    ["a", { firstName: "John"; lastName: "Doe" }],
    ["b", { firstName: "Jane"; lastName: "Doe" }]
  ];

  // WHEN
  type Result = Object.FromEntries<Input>;

  // THEN
  type Expected = {
    a: { firstName: "John"; lastName: "Doe" };
    b: { firstName: "Jane"; lastName: "Doe" };
  };
  Assert<IsExactType<Result, Expected>>();
}

// Test: FilterProperties
{
  // GIVEN
  type Input = {
    a: { firstName: "John"; lastName: "Doe" };
    b: { firstName: "Jane"; lastName: "Doe" };
    c: { firstName: "John"; lastName: "Smith" };
  };

  interface $Predicate extends HKT {
    return: this["B"]["firstName"] extends "John" ? true : false;
  }

  // WHEN
  type Result = Object.FilterProperties<Input, $Predicate>;

  // THEN
  type Expected = {
    a: { firstName: "John"; lastName: "Doe" };
    c: { firstName: "John"; lastName: "Smith" };
  };
  Assert<IsExactType<Result, Expected>>();
}
