import { Assert, type IsExactType } from "typebolt";
import { HKT } from "../HKT";
import { Tuple } from "../Tuple";

// Test: Tuple.Map
{
  {
    type Stringifiable = string | number | boolean | null | undefined;

    interface $ToString extends HKT {
      return: this["A"] extends Stringifiable ? `${this["A"]}` : never;
    }

    type Input = [1, 2];
    type Output = Tuple.Map<Input, $ToString>;

    type Expected = ["1", "2"];
    Assert<IsExactType<Expected, Output>>();
  }

  {
    interface $Duplicate extends HKT {
      return: [this["A"], this["A"]];
    }

    type Input = Array<number>;
    type Output = Tuple.Map<Input, $Duplicate>;

    type Expected = Array<[number, number]>;
    Assert<IsExactType<Expected, Output>>();
  }
}
