import * as test from "tape";
import MockResponse from "../../MockResponse";
import { createRequest } from "../../MockRequest";
import { match, createHandler } from "../../Matcher";

test("should create a handler (GET)", t => {
  const handler = (req: any, res: any) => new MockResponse();
  const matcher = createHandler("GET", "/foo", handler);

  const req = createRequest();
  const res = new MockResponse();
  t.deepEqual(matcher(req, res), {});

  const req2 = createRequest();
  req2.url = "/foo";
  t.deepEqual(matcher(req2, res), {
    body: "",
    headers: {},
    status: 200,
    timeout: 0,
  });
  t.end();
});

test("should create a regex handler", t => {
  const handler = (req: any, res: any) => new MockResponse();
  const matcher = createHandler("GET", /foo/g, handler);

  const req = createRequest();
  req.url = "/foo/bar";

  const res = new MockResponse();
  t.deepEqual(matcher(req, res), {
    body: "",
    headers: {},
    status: 200,
    timeout: 0,
  });

  t.end();
});
