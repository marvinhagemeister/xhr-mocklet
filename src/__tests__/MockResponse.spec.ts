import * as test from "tape";
import MockResponse from "../MockResponse";

test("should get/set body", t => {
  const res = new MockResponse();

  res.body("foo");
  t.equal(res.body(), "foo");

  res.body({  foo: "bar" });
  t.equal(res.body(), "{\"foo\":\"bar\"}");
  t.end();
});

test("should get/set timeout", t => {
  const res = new MockResponse();

  res.timeout(true);
  t.equal(res.timeout(), 1);

  res.timeout(100);
  t.equal(res.timeout(), 100);
  t.end();
});

test("should get/set http header", t => {
  const res = new MockResponse();

  res.header("foo", "bar");
  t.equal(res.header("foo"), "bar");

  res.header("FOO", "bar");
  t.equal(res.header("foo"), "bar");
  t.end();
});

test("should get/set all http headers at once", t => {
  const res = new MockResponse();

  res.headers({ foo: "bar" });
  t.deepEqual(res.headers(), {  foo: "bar" });
  t.end();
});

test("should get/set status code", t => {
  const res = new MockResponse();
  res.status(200);
  t.equal(res.status(), 200);
  t.end();
});
