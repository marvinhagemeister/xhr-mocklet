import { assert as t } from "chai";
import * as index from "../index";

describe("index", () => {
  it("should export all modules", () => {
    t.deepEqual(Object.keys(index), [
      "MockXMLHttpRequest",
      "MockResponse",
      "MockRequest",
      "default",
    ]);
  });
});
