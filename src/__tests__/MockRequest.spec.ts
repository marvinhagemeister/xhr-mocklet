import { assert as t } from "chai";
import MockXMLHttpRequest from "../MockXMLHttpRequest";
import MockRequest from "../MockRequest";

describe("MockRequest", () => {
  it("should parse query", () => {
    const xhr = new MockXMLHttpRequest();
    xhr.open("GET", "https://example.com/path?a=1&b=2");

    const req = new MockRequest(xhr);
    t.deepEqual(req.query(), { a: 1, b: 2 });
  });
});
