import { assert as t } from "chai";
import * as index from "../index";

it("should export all modules", done => {
  t.deepEqual(Object.keys(index), [
    "MockXMLHttpRequest",
    "MockResponse",
    "default",
  ]);
  done();
});
