export interface HKT {
  args: unknown[];
  A: this["args"] extends [infer A, any, any, any] ? A : any;
  B: this["args"] extends [any, infer B, any, any] ? B : any;
  C: this["args"] extends [any, any, infer C, any] ? C : any;
  D: this["args"] extends [any, any, any, infer D] ? D : any;
  return: unknown;
}

export namespace HKT {
  export type Call<
    H extends HKT,
    A,
    B = unknown,
    C = unknown,
    D = unknown
  > = (H & { args: [A, B, C, D] })["return"];
}
