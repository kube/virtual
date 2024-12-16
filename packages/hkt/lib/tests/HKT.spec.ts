import { Assert, IsExactType } from "typebolt";
import { HKT } from "../HKT";

//
// Test: HKT
//

// Identity
{
  // GIVEN
  interface $Identity extends HKT {
    return: this["A"];
  }

  // THEN
  Assert<IsExactType<HKT.Call<$Identity, 42>, 42>>();
}

// Simple Transform
{
  // GIVEN
  interface $ToString extends HKT {
    return: `${this["A"]}`;
  }

  // THEN
  Assert<IsExactType<HKT.Call<$ToString, 42>, "42">>();

  // @ts-expect-error: Not allowed because only accepts number
  type _ = HKT.Call<$IsNumber, "42">;
}
