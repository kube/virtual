import { Schema_Interface, Schema_Record } from "./Schema";

// TODO: This could simplified for more efficiency
export type GetRecordFields<S extends Schema_Record | Schema_Interface> = {
  [K in {
    [K in keyof S["fields"]]: K extends number ? S["fields"][K] : never;
  }[keyof S["fields"]]["name"]]: S["fields"][number] & { name: K };
};
