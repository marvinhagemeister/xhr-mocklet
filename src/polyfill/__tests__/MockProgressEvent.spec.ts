import * as test from "tape";
import MockProgressEvent from "../MockProgressEvent";

test("should initialize constructor args", t => {
  const ev = new MockProgressEvent("foo", { loaded: 10 });
  t.equal(ev.type, "foo");
  t.equal(ev.loaded, 10);
  t.end();
});

test("should initProgressEvent", t => {
  const ev = new MockProgressEvent("foo");
  ev.initProgressEvent("nope", true, true, true, 10, 20);
  t.equal(ev.type, "nope");
  t.equal(ev.bubbles, true);
  t.equal(ev.cancelable, true);
  t.equal(ev.lengthComputable, true);
  t.equal(ev.loaded, 10);
  t.equal(ev.total, 20);
  t.end();
});
