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
    ["b", { firstName: "Jane"; lastName: "Doe" }],
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
