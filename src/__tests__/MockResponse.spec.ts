import { assert as t } from "chai";
import MockResponse from "../MockResponse";

describe("MockResponse", () => {
  it("should get/set body", () => {
    const res = new MockResponse();

    res.body("foo");
    t.equal(res.body(), "foo");

    res.body({ foo: "bar" });
    t.equal(res.body(), "{\"foo\":\"bar\"}");
  });

  it("should get/set timeout", () => {
    const res = new MockResponse();

    res.timeout(true);
    t.equal(res.timeout(), 0);

    res.timeout(100);
    t.equal(res.timeout(), 100);
  });

  it("should get/set http header", () => {
    const res = new MockResponse();

    res.header("foo", "bar");
    t.equal(res.header("foo"), "bar");

    res.header("FOO", "bar");
    t.equal(res.header("foo"), "bar");
  });

  it("should get/set all http headers at once", () => {
    const res = new MockResponse();

    res.headers({ foo: "bar" });
    t.deepEqual(res.headers(), { foo: "bar" });
  });

  it("should get/set status code", () => {
    const res = new MockResponse();
    res.status(200);
    t.equal(res.status(), 200);
  });
});
