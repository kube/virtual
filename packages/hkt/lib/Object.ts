import { HKT } from "./HKT";

export namespace Object {
  //
  // MapValues
  //

  type _MapValues<
    Mapper extends HKT,
    O extends Record<string, any>,
    Context
  > = {
    [K in keyof O]: HKT.Call<Mapper, O[K], Context>;
  };

  // HKT
  export interface $MapValues extends HKT {
    return: _MapValues<this["A"], this["B"], this["C"]>;
  }

  // Call Shortcut
  export type MapValues<
    O extends Record<string, Mapper["args"][0]>,
    Mapper extends HKT,
    Context = never
  > = HKT.Call<$MapValues, Mapper, O, Context>;

  //
  // FromEntries
  //

  type _FromEntries<O extends readonly (readonly [string, unknown])[]> = {
    [K in O[number] as K[0]]: K[1];
  };

  export interface $FromEntries extends HKT {
    return: this["A"] extends readonly (readonly [string, unknown])[]
      ? _FromEntries<this["A"]>
      : this["A"];
  }

  export type FromEntries<O extends readonly (readonly [string, unknown])[]> =
    _FromEntries<O>;

  //
  // FilterProperties
  //

  type _FilterProperties<
    T extends Record<string, unknown>,
    Predicate extends HKT
  > = {
    [K in {
      [K in keyof T]: HKT.Call<Predicate, K, T[K]> extends true ? K : never;
    }[keyof T]]: T[K];
  };

  export interface $FilterProperties extends HKT {
    return: _FilterProperties<this["A"], this["B"]>;
  }

  export type FilterProperties<
    T extends Record<string, unknown>,
    Predicate extends HKT
  > = HKT.Call<$FilterProperties, T, Predicate>;
}
