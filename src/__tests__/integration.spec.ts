import { assert as t } from "chai";
import mock from "../Builder";

describe("Integration", () => {
  beforeEach(() => mock.setup(global));
  afterEach(() => mock.teardown());

  it("should allow registering the handler", done => {
    mock.mock((req, res) => res
      .status(200)
      .body("OK"));

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/");
    xhr.onload = () => {
      t.equal(xhr.responseText, "OK");
      done();
      mock.teardown();
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

    t.equal(mock.XMLHttpRequest.registry.handlers.length, 2);

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/a");
    xhr.onload = () => {
      t.equal(xhr.responseText, "A");
      done();
    };
    xhr.send();
  });

  // it("should allow registering a handler with URL regexp", m(done => {
  //   mock.post(/\/a\/\d+/, (req, res) => {
  //     return res
  //       .status(200)
  //       .body(req.url().split("/")[2]);
  //   });

  //   const xhr = new XMLHttpRequest();
  //   xhr.open("POST", "/a/123");
  //   xhr.onload = () => {
  //     t.equal(xhr.responseText, "123");
  //     done();
  //   };
  //   xhr.send();
  // }));

  // it("should support POST method", m(done => {
  //   mock.post("/foo/123", (req, res) => res.body("123"));

  //   const xhr = new XMLHttpRequest();
  //   xhr.open("POST", "/foo/123");
  //   xhr.onload = () => {
  //     t.equal(xhr.responseText, "123");
  //     done();
  //   };
  //   xhr.send();
  // }));

  // it("should support PUT method", m(done => {
  //   mock.put("/foo/123", (req, res) => res.body("123"));

  //   const xhr = new XMLHttpRequest();
  //   xhr.open("PUT", "/foo/123");
  //   xhr.onload = () => {
  //     t.equal(xhr.responseText, "123");
  //     done();
  //   };
  //   xhr.send();
  // }));

  // it("should support PATCH method", m(done => {
  //   mock.patch("/foo/123", (req, res) => res.body("123"));

  //   const xhr = new XMLHttpRequest();
  //   xhr.open("PATCH", "/foo/123");
  //   xhr.onload = () => {
  //     t.equal(xhr.responseText, "123");
  //     done();
  //   };
  //   xhr.send();
  // }));

  // it("should support DELETE method", m(done => {
  //   mock.delete("/foo/123", (req, res) => res.body("123"));

  //   const xhr = new XMLHttpRequest();
  //   xhr.open("DELETE", "/foo/123");
  //   xhr.onload = () => {
  //     t.equal(xhr.responseText, "123");
  //     done();
  //   };
  //   xhr.send();
  // }));

  // it("should call error callback", m(done => {
  //   mock.get("/foo", (req, res) => null);

  //   const xhr = new XMLHttpRequest();
  //   xhr.addEventListener("error", ev => {
  //     t.equal(ev instanceof MockProgressEvent, true);
  //     t.equal(ev.type, "error");
  //     done();
  //   });
  //   xhr.open("GET", "/foo");
  //   xhr.send();
  // }));

  // it("should call onreadystatechange callback", m(done => {
  //   mock.get("/foo", (req, res) => null);

  //   const xhr = new XMLHttpRequest();
  //   xhr.onreadystatechange = ev => {
  //     t.equal(ev instanceof MockProgressEvent, false);
  //     t.equal(ev.type, "readystatechange");
  //     done();
  //   };
  //   xhr.open("GET", "/foo");
  //   xhr.send();
  // }));

  // it("should call loadend callback", m(done => {
  //   mock.get("/foo", (req, res) => null);

  //   const xhr = new XMLHttpRequest();
  //   xhr.addEventListener("loadend", ev => {
  //     t.equal(ev instanceof MockProgressEvent, true);
  //     t.equal(ev.type, "loadend");
  //     done();
  //   });
  //   xhr.open("GET", "/foo");
  //   xhr.send();
  // }));

  // it("should call load callback", m(done => {
  //   mock.get("/foo", (req, res) => res.body("foo"));

  //   const xhr = new XMLHttpRequest();
  //   xhr.addEventListener("load", ev => {
  //     t.equal(ev instanceof MockProgressEvent, true);
  //     t.equal(ev.type, "load");
  //     done();
  //   });
  //   xhr.open("GET", "/foo");
  //   xhr.send();
  // }));

  // it("should call timeout callback", m(done => {
  //   mock.get("/foo", (req, res) => res.timeout(true));

  //   const xhr = new XMLHttpRequest();
  //   xhr.addEventListener("timeout", ev => {
  //     t.equal(ev instanceof MockProgressEvent, true);
  //     t.equal(ev.type, "timeout");
  //     done();
  //   });
  //   xhr.open("GET", "/foo");
  //   xhr.send();
  // }));

  // it("should call abort callback", m(done => {
  //   mock.get("/foo", (req, res) => res.timeout(100));

  //   const xhr = new XMLHttpRequest();
  //   xhr.addEventListener("abort", ev => {
  //     t.equal(ev instanceof MockProgressEvent, true);
  //     t.equal(ev.type, "abort");
  //     done();
  //   });
  //   xhr.open("GET", "/foo");
  //   xhr.send();
  //   xhr.abort();
  // }));

  // it("should call loadstart callback", m(done => {
  //   mock.get("/foo", (req, res) => res.body("hello"));

  //   const xhr = new XMLHttpRequest();
  //   xhr.addEventListener("loadstart", ev => {
  //     t.equal(ev instanceof MockProgressEvent, true);
  //     t.equal((ev as MockProgressEvent).loaded, 0);
  //     t.equal((ev as MockProgressEvent).total, 0);
  //     t.equal(ev.type, "loadstart");
  //     done();
  //   });
  //   xhr.open("GET", "/foo");
  //   xhr.send();
  // }));
});
