import * as test from "tape";
import MockEvent from "../MockEvent";

test("should initialize constructor args", t => {
  const ev = new MockEvent("foo", { bubbles: false });
  t.equal(ev.type, "foo");
  t.equal(ev.bubbles, false);
  t.end();
});

test("should initEvent", t => {
  const ev = new MockEvent("foo");
  ev.initEvent("nope", true, true);
  t.equal(ev.type, "nope");
  t.equal(ev.bubbles, true);
  t.equal(ev.cancelable, true);
  t.end();
});

test("should preventDefault", t => {
  const ev = new MockEvent("foo");
  ev.preventDefault();
  t.equal(ev.defaultPrevented, true);
  t.end();
});

test("should deepPath", t => {
  const ev = new MockEvent("foo");
  t.deepEqual(ev.deepPath(), []);
  t.end();
});

test("should do nothing on not implemented methods", t => {
  const ev = new MockEvent("foo");
  ev.stopImmediatePropagation();
  ev.stopPropagation();
  t.end();
});
