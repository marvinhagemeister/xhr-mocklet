import { assert as t } from "chai";
import MockResponse from "../MockResponse";
import { createRequest } from "../MockRequest";
import { match, createHandler } from "../Matcher";

describe("createHandler", () => {
  it("should create a handler (GET)", () => {
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
  });

  it("should create a regex handler", () => {
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
  });
});

describe("match", () => {
  it("should match", () => {
    const req = {
      body: "",
      headers: {},
      method: "GET",
      url: "/foo",
    };

    t.equal(match("GET", "/foo")(req), true);
    t.equal(match("GET", /foo/g)(req), true);
    t.equal(match("GET", /bar/g)(req), false);
    t.equal(match("POST", "foo")(req), false);
  });
});
