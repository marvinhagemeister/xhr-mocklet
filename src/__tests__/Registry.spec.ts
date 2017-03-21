import { assert as t } from "chai";
import MockXMLHttpRequest from "../MockXMLHttpRequest";
import MockResponse from "../MockResponse";
import Registry, { StrictRequestHandler } from "../Registry";

describe("Registry", () => {
  it("should add a handler", () => {
    const registry = new Registry();
    const handler: StrictRequestHandler = (req, res) =>
      res.body("foo").build();

    registry.add(handler);
    t.equal(registry.handlers.length, 1);
  });

  it("should remove a handler", () => {
    const registry = new Registry();
    const handler: StrictRequestHandler = (req, res) =>
      res.body("foo").build();

    registry.add(handler);
    t.equal(registry.handlers.length, 1);

    registry.remove(handler);
    t.equal(registry.handlers.length, 0);
  });

  it("should reset handlers (remove all)", () => {
    const registry = new Registry();
    const handler: StrictRequestHandler = (req, res) =>
      res.body("foo").build();

    registry.add(handler);
    registry.add(handler);
    t.equal(registry.handlers.length, 2);

    registry.reset();
    t.equal(registry.handlers.length, 0);
  });

  it("should do nothing if no handlers present", () => {
    const registry = new Registry();
    const xhr = new MockXMLHttpRequest();
    t.deepEqual(registry.handle(xhr), {});
  });

  it("should handle xhr request", () => {
    const response = new MockResponse().body("foo").build();
    const handler: StrictRequestHandler = (req, res) => response;

    const registry = new Registry();
    registry.add(handler);

    const xhr = new MockXMLHttpRequest();
    t.deepEqual(registry.handle(xhr), response);
  });
});
