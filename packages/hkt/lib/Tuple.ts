import type { HKT } from "./HKT";

export namespace Tuple {
  type _Map<Input extends unknown[], Mapper extends HKT> = {
    [K in keyof Input]: HKT.Call<Mapper, Input[K]>;
  };

  export interface $Map extends HKT {
    return: this["A"] extends Array<unknown>
    ? _Map<this["A"], this["B"]>
    : this["A"];
  }

  export type Map<Input extends readonly any[], Mapper extends HKT> = HKT.Call<
    $Map,
    Input,
    Mapper
  >;
}
