import * as sinon from "sinon";
import { assert as t } from "chai";
import mock from "../Builder";
import MockProgressEvent from "../polyfill/MockProgressEvent";

describe("Builder", () => {
  it("should setup and teardown the mock XMLHttpRequest class", () => {
    const window = { XMLHttpRequest: "realXHR" };
    const xhr = window.XMLHttpRequest;

    mock.setup(window);
    t.notEqual(window.XMLHttpRequest, xhr);

    mock.teardown();
    t.equal(window.XMLHttpRequest, xhr);
  });

  it("should remove any handlers", () => {
    const window = {};
    const noop = (res: any) => res;

    mock.get("http://www.google.com/", noop);

    mock.setup(window);
    t.equal(mock.XMLHttpRequest.registry.handlers.length, 0);

    mock.get("http://www.google.com/", noop);
    t.equal(mock.XMLHttpRequest.registry.handlers.length, 1);

    mock.teardown();
    t.equal(mock.XMLHttpRequest.registry.handlers.length, 0);
  });
});

describe("Builder mock", () => {
  beforeEach(() => mock.setup(global));
  afterEach(() => mock.teardown());

  it("should make readyStates available statically", () => {
    t.equal(XMLHttpRequest.UNSENT, 0);
    t.equal(XMLHttpRequest.OPENED, 1);
    t.equal(XMLHttpRequest.HEADERS_RECEIVED, 2);
    t.equal(XMLHttpRequest.LOADING, 3);
    t.equal(XMLHttpRequest.DONE, 4);
  });
});
