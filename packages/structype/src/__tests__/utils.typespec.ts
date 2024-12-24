import { Assert, IsExactType } from "typebolt";
import { Schema_Record } from "../Schema";
import { GetRecordFields } from "../utils";

// Test: GetRecordFields
{
  // GIVEN
  const schema = {
    _structype: "record",
    name: "SomeType",
    fields: [
      { name: "a", type: { _structype: "string" } },
      { name: "b", type: { _structype: "number" } },
    ],
  } as const satisfies Schema_Record;

  // WHEN
  type Result = GetRecordFields<typeof schema>;

  // THEN
  type Expected = {
    a: { name: "a", type: { _structype: "string" } };
    b: { name: "b", type: { _structype: "number" } };
  };

  Assert<IsExactType<Result, Expected>>();
}
