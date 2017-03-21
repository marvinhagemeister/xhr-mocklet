import * as sinon from "sinon";
import * as test from "tape";
import mock from "../Builder";
import MockProgressEvent from "../polyfill/MockProgressEvent";
import { m } from "./utils";

test("should setup and teardown the mock XMLHttpRequest class", t => {
  const window = { XMLHttpRequest: "realXHR" };
  const xhr = window.XMLHttpRequest;

  mock.setup(window);
  t.notEqual(window.XMLHttpRequest, xhr);

  mock.teardown();
  t.equal(window.XMLHttpRequest, xhr);
  t.end();
});

test("should remove any handlers", t => {
  const window = {};
  const noop = (res: any) => res;

  mock.get("http://www.google.com/", noop);

  mock.setup(window);
  t.equal(mock.XMLHttpRequest.registry.handlers.length, 0);

  mock.get("http://www.google.com/", noop);
  t.equal(mock.XMLHttpRequest.registry.handlers.length, 1);

  mock.teardown();
  t.equal(mock.XMLHttpRequest.registry.handlers.length, 0);
  t.end();
});

test("should make readyStates available statically", m(t => {
  t.equal(XMLHttpRequest.UNSENT, 0);
  t.equal(XMLHttpRequest.OPENED, 1);
  t.equal(XMLHttpRequest.HEADERS_RECEIVED, 2);
  t.equal(XMLHttpRequest.LOADING, 3);
  t.equal(XMLHttpRequest.DONE, 4);
  t.end();
}));
