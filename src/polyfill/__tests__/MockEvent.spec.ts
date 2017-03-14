import { assert as t } from "chai";
import MockEvent from "../MockEvent";

describe("MockEvent", () => {
  it("should initialize constructor args", () => {
    const ev = new MockEvent("foo", { bubbles: false });
    t.equal(ev.type, "foo");
    t.equal(ev.bubbles, false);
  });

  it("should initEvent", () => {
    const ev = new MockEvent("foo");
    ev.initEvent("nope", true, true);
    t.equal(ev.type, "nope");
    t.equal(ev.bubbles, true);
    t.equal(ev.cancelable, true);
  });

  it("should preventDefault", () => {
    const ev = new MockEvent("foo");
    ev.preventDefault();
    t.equal(ev.defaultPrevented, true);
  });

  it("should deepPath", () => {
    const ev = new MockEvent("foo");
    t.deepEqual(ev.deepPath(), []);
  });

  it("should do nothing on not implemented methods", () => {
    const ev = new MockEvent("foo");
    ev.stopImmediatePropagation();
    ev.stopPropagation();
  });
});
