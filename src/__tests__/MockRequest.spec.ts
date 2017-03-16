import * as test from "tape";
import MockXMLHttpRequest from "../MockXMLHttpRequest";
import MockRequest from "../MockRequest";

test("should parse query", t => {
  const xhr = new MockXMLHttpRequest();
  xhr.open("GET", "https://example.com/path?a=1&b=2");

  const req = new MockRequest(xhr);
  t.deepEqual(req.query(), { a: 1, b: 2 });
  t.end();
});
