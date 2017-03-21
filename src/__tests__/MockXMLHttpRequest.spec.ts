import { assert as t } from "chai";
import * as sinon from "sinon";
import MockXMLHttpRequest from "../MockXMLHttpRequest";
import MockProgressEvent from "../polyfill/MockProgressEvent";
import Registry from "../Registry";
import { HTTP_METHOD_OUTDATED, HTTP_METHODS } from "../utils";

/* tslint:disable only-arrow-functions */

describe("MockXMLHttpRequest", () => {
  it("should throw if responseText is not \"\" or \"text\"", () => {
    const xhr = new MockXMLHttpRequest();
    t.throws(() => xhr.responseText);
  });

  it("should return \"\" if readyState < LOADING", () => {
    const xhr = new MockXMLHttpRequest();
    (xhr as any)._responseType = "text";
    (xhr as any).readyState = MockXMLHttpRequest.OPENED;
    t.equal(xhr.responseText, "");
  });

  it("should return responseText", () => {
    const xhr = new MockXMLHttpRequest();
    (xhr as any)._responseType = "text";
    (xhr as any)._responseText = "foo";
    (xhr as any).readyState = MockXMLHttpRequest.DONE;
    t.equal(xhr.responseText, "foo");
  });

  it("should throw on set if Request is done", () => {
    const xhr = new MockXMLHttpRequest();
    (xhr as any).readyState = MockXMLHttpRequest.LOADING;
    t.throws(() => xhr.responseType = "text");
  });

  it("should get/set responseType", () => {
    const xhr = new MockXMLHttpRequest();
    (xhr as any)._responseType = "text";
    (xhr as any).readyState = MockXMLHttpRequest.OPENED;
    xhr.responseType = "text";
    t.equal(xhr.responseType, "text");
  });

  it("should throw on set if not async", () => {
    const xhr = new MockXMLHttpRequest();
    xhr.async = false;
    t.throws(() => xhr.timeout = 20);
  });

  it("should get/set timeout", () => {
    const xhr = new MockXMLHttpRequest();
    xhr.timeout = 20;
    t.equal(xhr.timeout, 20);
  });

  it("should throw on set if request is already in progress", () => {
    const xhr = new MockXMLHttpRequest();
    (xhr as any).readyState = MockXMLHttpRequest.DONE;
    t.throws(() => xhr.withCredentials = false);
  });

  it("should get/set withCredentials", () => {
    const xhr = new MockXMLHttpRequest();
    xhr.withCredentials = true;
    t.equal(xhr.withCredentials, true);
  });

  it("should set a header", done => {
    const registry = new Registry();
    registry.add((req, res) => {
      t.equal(req.headers["Content-Type"], "application/json");
      done();
      return {};
    });

    const xhr = new MockXMLHttpRequest(registry);
    xhr.open("get", "/");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
  });

  it("should be OPENED", () => {
    const xhr = new MockXMLHttpRequest();
    xhr.open("get", "/");
    t.equal(xhr.readyState, xhr.OPENED);
  });

  it("should throw on outdated HTTP methods", () => {
    const xhr = new MockXMLHttpRequest();
    HTTP_METHOD_OUTDATED.forEach(method => {
      t.throws(() => xhr.open(method, "/"));
    });
  });

  it("should throw on invalid HTTP methods", () => {
    const xhr = new MockXMLHttpRequest();
    ["foo", "BAZ"].forEach(method => {
      t.throws(() => xhr.open(method, "/"));
    });
  });

  it("should NOT have a request body if GET", done => {
    const registry = new Registry();
    registry.add((req, res) => {
      t.equal(req.body, null);
      done();
      return {};
    });

    const xhr = new MockXMLHttpRequest(registry);
    xhr.open("GET", "/");
    xhr.send("Hello World!");
  });

  it("should NOT have a request body if HEAD", done => {
    const registry = new Registry();
    registry.add((req, res) => {
      t.equal(req.body, null);
      done();
      return {};
    });

    const xhr = new MockXMLHttpRequest(registry);
    xhr.open("HEAD", "/");
    xhr.send("Hello World!");
  });

  it("should have a request body", done => {
    const registry = new Registry();
    registry.add((req, res) => {
      t.equal(req.body, "Hello World!");
      done();
      return {};
    });

    const xhr = new MockXMLHttpRequest(registry);
    xhr.open("POST", "/");
    xhr.send("Hello World!");
  });

  it("should time out after 100ms", done => {
    const registry = new Registry();
    registry.add((req, res) => res.timeout(true).build());

    let start: any;
    let end: any;
    const xhr = new MockXMLHttpRequest(registry);
    xhr.timeout = 100;
    xhr.open("get", "/");
    xhr.ontimeout = () => {
      end = Date.now();
      t.isTrue(end - start >= 100);
      t.equal(xhr.readyState, 4);
      done();
    };
    start = Date.now();
    xhr.send();
  });

  it("should time out after 5ms even though the timeout is set to timeout after 2ms", done => {
    const registry = new Registry();
    registry.add((req, res) => res.timeout(5).build());

    const xhr = new MockXMLHttpRequest(registry);
    xhr.timeout = 2;
    xhr.open("get", "/");

    let start: any;
    let end: any;
    xhr.ontimeout = () => {
      end = Date.now();
      t.isTrue(end - start >= 5);
      t.equal(xhr.readyState, xhr.DONE);
      done();
    };
    start = Date.now();
    xhr.send();
  });

  it("should not time out after 10ms when the request has been aborted", done => {
    const registry = new Registry();
    registry.add((req, res) => res.timeout(10).build());

    let aborted = false;
    let timedout = false;

    const xhr = new MockXMLHttpRequest(registry);
    xhr.open("get", "/");
    xhr.ontimeout = () => timedout = true;
    xhr.onabort = () => aborted = true;
    xhr.send();
    xhr.abort();

    setTimeout(() => {
      t.isTrue(aborted);
      t.isTrue(!timedout);
      done();
    }, 10);
  });

  it("should have a response header", done => {
    const registry = new Registry();
    registry.add((req, res) =>
      res.header("Content-Type", "application/json").build());

    const xhr = new MockXMLHttpRequest(registry);
    xhr.open("get", "/");
    xhr.onload = () => {
      t.equal(xhr.getResponseHeader("Content-Type"), "application/json");
      done();
    };
    xhr.send();
  });

  it("should have a response header", done => {
    const registry = new Registry();
    registry.add((req, res) =>
      res
        .header("Content-Type", "application/json")
        .header("X-Powered-By", "SecretSauce")
        .build());

    const xhr = new MockXMLHttpRequest(registry);
    xhr.open("get", "/");
    xhr.onload = () => {
      t.equal(xhr.getAllResponseHeaders(), "content-type: application/json\r\nx-powered-by: SecretSauce\r\n");
      done();
    };
    xhr.send();
  });

  it("should allow registering load event listener", done => {
    const registry = new Registry();
    registry.add((req, res) => res.build());

    const xhr = new MockXMLHttpRequest(registry);
    xhr.addEventListener("load", function(event) {
      t.equal(event.currentTarget, xhr);
      t.equal(event.type, "load");
      t.equal(this, xhr);
      done();
    });
    xhr.open("get", "/");
    xhr.send();
  });

  it("should allow registering abort event listener", done => {
    const registry = new Registry();
    registry.add((req, res) => res.build());

    const xhr = new MockXMLHttpRequest(registry);
    xhr.addEventListener("abort", function(event) {
      t.equal(event.currentTarget, xhr);
      t.equal(this, xhr);
      done();
    });
    xhr.open("get", "/");
    xhr.send();
    xhr.abort();
  });

  it("should allow registering progress event listener", done => {
    const registry = new Registry();
    registry.add((req, res) => res.progress(50, 100).build());

    const xhr = new MockXMLHttpRequest();
    xhr.addEventListener("progress", event => {
      t.equal(event instanceof MockProgressEvent, true);
      t.equal(event.type, "progress");
      t.equal(event.lengthComputable, true);
      t.equal(event.loaded, 50);
      t.equal(event.total, 100);
      done();
    });
    xhr.open("get", "/");
    xhr.send();
  });

  it("should allow unregistering event listener", done => {
    const registry = new Registry();
    registry.add((req, res) => res.build());

    const spy = sinon.spy();
    const xhr = new MockXMLHttpRequest(registry);

    xhr.addEventListener("load", spy);
    xhr.removeEventListener("load", spy);
    xhr.open("get", "/");
    xhr.send();

    setTimeout(() => {
      t.equal(spy.callCount, 0);
      done();
    }, 5);
  });
});
