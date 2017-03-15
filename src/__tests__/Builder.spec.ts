import { assert as t } from "chai";
import * as sinon from "sinon";
import * as window from "global";
import mock from "../Builder";
import MockProgressEvent from "../polyfill/MockProgressEvent";

const noop = (res: any) => res;

describe("Builder", () => {
  it("should setup and teardown the mock XMLHttpRequest class", () => {
    const xhr = (global as any).XMLHttpRequest;
    mock.setup();
    t.notEqual((global as any).XMLHttpRequest, xhr);
    mock.teardown();
    t.equal((global as any).XMLHttpRequest, xhr);
  });

  it("should remove any handlers", () => {
    mock.get("http://www.google.com/", noop);
    mock.setup();
    t.equal(mock.XMLHttpRequest.handlers.length, 0);
    mock.get("http://www.google.com/", noop);
    t.equal(mock.XMLHttpRequest.handlers.length, 1);
    mock.teardown();
    t.equal(mock.XMLHttpRequest.handlers.length, 0);
  });
});

describe("Builder#mock()", () => {
  beforeEach(() => mock.setup());
  afterEach(() => mock.teardown());

  it("should make readyStates available statically", () => {
    t.equal(XMLHttpRequest.UNSENT, 0);
    t.equal(XMLHttpRequest.OPENED, 1);
    t.equal(XMLHttpRequest.HEADERS_RECEIVED, 2);
    t.equal(XMLHttpRequest.LOADING, 3);
    t.equal(XMLHttpRequest.DONE, 4);
  });

  it("should allow registering the handler", done => {
    mock.mock((req, res) => res
      .status(200)
      .body("OK"));

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/");
    xhr.onload = () => {
      t.equal(xhr.responseText, "OK");
      done();
    };
    xhr.send();
  });

  it("should allow registering a specific URL handler", done => {
    mock.mock("GET", "/a", (req, res) => {
      return res
        .status(200)
        .body("A");
    });

    mock.get("/b", (req, res) => {
      return res
        .status(200)
        .body("B");
    });

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/a");
    xhr.onload = () => {
      t.equal(xhr.responseText, "A");
      done();
    };
    xhr.send();
  });

  it("should allow registering a handler with URL regexp", done => {
    mock.post(/\/a\/\d+/, (req, res) => {
      return res
        .status(200)
        .body(req.url().split("/")[2]);
    });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/a/123");
    xhr.onload = () => {
      t.equal(xhr.responseText, "123");
      done();
    };
    xhr.send();
  });

  it("should support POST method", done => {
    mock.post("/foo/123", (req, res) => res.body("123"));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/foo/123");
    xhr.onload = () => {
      t.equal(xhr.responseText, "123");
      done();
    };
    xhr.send();
  });

  it("should support PUT method", done => {
    mock.put("/foo/123", (req, res) => res.body("123"));

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", "/foo/123");
    xhr.onload = () => {
      t.equal(xhr.responseText, "123");
      done();
    };
    xhr.send();
  });

  it("should support PATCH method", done => {
    mock.patch("/foo/123", (req, res) => res.body("123"));

    const xhr = new XMLHttpRequest();
    xhr.open("PATCH", "/foo/123");
    xhr.onload = () => {
      t.equal(xhr.responseText, "123");
      done();
    };
    xhr.send();
  });

  it("should support DELETE method", done => {
    mock.delete("/foo/123", (req, res) => res.body("123"));

    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/foo/123");
    xhr.onload = () => {
      t.equal(xhr.responseText, "123");
      done();
    };
    xhr.send();
  });

  it("should call error callback", done => {
    mock.get("/foo", (req, res) => null);

    const xhr = new XMLHttpRequest();
    xhr.addEventListener("error", ev => {
      t.equal(ev instanceof MockProgressEvent, true);
      t.equal(ev.type, "error");
      done();
    });
    xhr.open("GET", "/foo");
    xhr.send();
  });

  it("should call onreadystatechange callback", done => {
    mock.get("/foo", (req, res) => null);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = ev => {
      t.equal(ev instanceof MockProgressEvent, false);
      t.equal(ev.type, "readystatechange");
      done();
    };
    xhr.open("GET", "/foo");
    xhr.send();
  });

  it("should call loadend callback", done => {
    mock.get("/foo", (req, res) => null);

    const xhr = new XMLHttpRequest();
    xhr.addEventListener("loadend", ev => {
      t.equal(ev instanceof MockProgressEvent, true);
      t.equal(ev.type, "loadend");
      done();
    });
    xhr.open("GET", "/foo");
    xhr.send();
  });

  it("should call load callback", done => {
    mock.get("/foo", (req, res) => res.body("foo"));

    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", ev => {
      t.equal(ev instanceof MockProgressEvent, true);
      t.equal(ev.type, "load");
      done();
    });
    xhr.open("GET", "/foo");
    xhr.send();
  });

  it.skip("should call timeout callback", done => {
    mock.get("/foo", (req, res) => res.timeout(true));

    const xhr = new XMLHttpRequest();
    xhr.addEventListener("timeout", ev => {
      t.equal(ev instanceof MockProgressEvent, true);
      t.equal(ev.type, "timeout");
      done();
    });
    xhr.open("GET", "/foo");
    xhr.send();
  });

  it("should call abort callback", done => {
    mock.get("/foo", (req, res) => res.timeout(100));

    const xhr = new XMLHttpRequest();
    xhr.addEventListener("abort", ev => {
      t.equal(ev instanceof MockProgressEvent, true);
      t.equal(ev.type, "abort");
      done();
    });
    xhr.open("GET", "/foo");
    xhr.send();
    xhr.abort();
  });

  it("should call loadstart callback", done => {
    mock.get("/foo", (req, res) => res.body("hello"));

    const xhr = new XMLHttpRequest();
    xhr.addEventListener("loadstart", ev => {
      t.equal(ev instanceof MockProgressEvent, true);
      t.equal((ev as MockProgressEvent).loaded, 0);
      t.equal((ev as MockProgressEvent).total, 0);
      t.equal(ev.type, "loadstart");
      done();
    });
    xhr.open("GET", "/foo");
    xhr.send();
  });
});
