import * as test from "tape";
import MockXMLHttpRequest from "../MockXMLHttpRequest";
import MockResponse from "../MockResponse";
import Registry, { StrictRequestHandler } from "../Registry";

test("should add a handler", t => {
  const registry = new Registry();
  const handler: StrictRequestHandler = (req, res) =>
    res.body("foo").build();

  registry.add(handler);
  t.equal(registry.handlers.length, 1);
  t.end();
});

test("should remove a handler", t => {
  const registry = new Registry();
  const handler: StrictRequestHandler = (req, res) =>
    res.body("foo").build();

  registry.add(handler);
  t.equal(registry.handlers.length, 1);

  registry.remove(handler);
  t.equal(registry.handlers.length, 0);
  t.end();
});

test("should reset handlers (remove all)", t => {
  const registry = new Registry();
  const handler: StrictRequestHandler = (req, res) =>
    res.body("foo").build();

  registry.add(handler);
  registry.add(handler);
  t.equal(registry.handlers.length, 2);

  registry.reset();
  t.equal(registry.handlers.length, 0);
  t.end();
});

test("should do nothing if no handlers present", t => {
  const registry = new Registry();
  const xhr = new MockXMLHttpRequest();
  t.deepEqual(registry.handle(xhr), {});
  t.end();
});

test("should handle xhr request", t => {
  const response = new MockResponse().body("foo").build();
  const handler: StrictRequestHandler = (req, res) => response;

  const registry = new Registry();
  registry.add(handler);

  const xhr = new MockXMLHttpRequest();
  t.deepEqual(registry.handle(xhr), response);
  t.end();
});
