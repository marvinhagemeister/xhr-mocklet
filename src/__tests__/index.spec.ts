import * as test from "tape";
import * as index from "../index";

test("should export all modules", t => {
  t.deepEqual(Object.keys(index), [
    "MockXMLHttpRequest",
    "MockResponse",
    "default",
  ]);
  t.end();
});
