import { HKT } from "./HKT";

export namespace Object {
  //
  // MapValues
  //

  type _MapValues<Mapper extends HKT, O extends Record<string, any>> = {
    [K in keyof O]: HKT.Call<Mapper, O[K]>;
  };

  // HKT
  export interface $MapValues extends HKT {
    return: _MapValues<this["A"], this["B"]>;
  }

  // Call Shortcut
  export type MapValues<
    O extends Record<string, Mapper["args"][0]>,
    Mapper extends HKT
  > = HKT.Call<$MapValues, Mapper, O>;


  //
  // FromEntries
  //

  type _FromEntries<O extends readonly (readonly [string, unknown])[]> = {
    [K in O[number]as K[0]]: K[1];
  };

  export interface $FromEntries extends HKT {
    return: this["A"] extends readonly (readonly [string, unknown])[]
    ? _FromEntries<this["A"]>
    : this["A"];
  }

  export type FromEntries<O extends readonly (readonly [string, unknown])[]> =
    _FromEntries<O>;
}
