import { assert as t } from "chai";
import * as sinon from "sinon";
import MockXMLHttpRequest from "../MockXMLHttpRequest";
import MockProgressEvent from "../polyfill/MockProgressEvent";
import { HTTP_METHOD_OUTDATED, HTTP_METHODS } from "../utils";

/* tslint:disable only-arrow-functions */

describe("MockXMLHttpRequest", () => {
  afterEach(() => {
    MockXMLHttpRequest.reset();
  });

  describe("setRequestHeader()", () => {
    it("should set a header", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        t.equal(req.header("content-type"), "application/json");
        done();
      });

      const xhr = new MockXMLHttpRequest();
      xhr.open("get", "/");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send();
    });
  });

  describe("open()", () => {
    it("should be OPENED", () => {
      const xhr = new MockXMLHttpRequest();
      xhr.open("get", "/");
      t.equal(xhr.readyState, xhr.OPENED);
    });

    it("should throw on outdated HTTP methods", () => {
      const xhr = new MockXMLHttpRequest();
      HTTP_METHOD_OUTDATED.forEach(method => {
        try {
          xhr.open(method, "/");
          t.fail();
        } catch (e) { /* noop */ }
      });
    });
  });

  describe("send()", () => {
    it("should have a request body", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        t.equal(req.body(), "Hello World!");
        done();
      });

      const xhr = new MockXMLHttpRequest();
      xhr.open("get", "/");
      xhr.send("Hello World!");
    });

    it("should not have a request body", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        t.equal(req.body(), null);
        done();
      });

      const xhr = new MockXMLHttpRequest();
      xhr.open("get", "/");
      xhr.send();
    });

    it("should time out after 100ms", done => {
      MockXMLHttpRequest.addHandler((req, res) => res.timeout(true));

      let start: any;
      let end: any;
      const xhr = new MockXMLHttpRequest();
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

    it("should time out after 100ms even though the timeout is set to timeout after 10ms", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        return res.timeout(100);
      });

      const xhr = new MockXMLHttpRequest();
      xhr.timeout = 10;
      xhr.open("get", "/");

      let start: any;
      let end: any;
      xhr.ontimeout = () => {
        end = Date.now();
        t.isTrue(end - start >= 100);
        t.equal(xhr.readyState, xhr.DONE);
        done();
      };
      start = Date.now();
      xhr.send();
    });

    it("should not time out after 100ms when the request has been aborted", done => {
      let aborted = false;
      let timedout = false;

      MockXMLHttpRequest.addHandler((req, res) => res.timeout(10));

      const xhr = new MockXMLHttpRequest();
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
  });

  describe("getResponseHeader()", () => {
    it("should have a response header", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        return res.header("Content-Type", "application/json");
      });

      const xhr = new MockXMLHttpRequest();
      xhr.open("get", "/");
      xhr.onload = () => {
        t.equal(xhr.getResponseHeader("Content-Type"), "application/json");
        done();
      };
      xhr.send();
    });
  });

  describe("getAllResponseHeaders()", () => {
    it("should have a response header", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        return res
          .header("Content-Type", "application/json")
          .header("X-Powered-By", "SecretSauce");
      });

      const xhr = new MockXMLHttpRequest();
      xhr.open("get", "/");
      xhr.onload = () => {
        t.equal(xhr.getAllResponseHeaders(), "content-type: application/json\r\nx-powered-by: SecretSauce\r\n");
        done();
      };
      xhr.send();
    });
  });

  describe("addEventListener()", () => {
    it("should allow registering load event listener", done => {
      MockXMLHttpRequest.addHandler((req, res) => res);

      const xhr = new MockXMLHttpRequest();
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
      MockXMLHttpRequest.addHandler((req, res) => res);

      const xhr = new MockXMLHttpRequest();
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
      MockXMLHttpRequest.addHandler((req, res) => {
        req.progress(50, 100);
        return res;
      });

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
      MockXMLHttpRequest.addHandler((req, res) => res);
      const spy = sinon.spy();

      const xhr = new MockXMLHttpRequest();
      const cb = () => done();

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
});
