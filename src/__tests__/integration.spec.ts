import * as test from "tape";
import mock from "../Builder";
import { m } from "./utils";

test("should allow registering the handler", m(t => {
  mock.mock((req, res) => res
    .status(200)
    .body("OK"));

  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/");
  xhr.onload = () => {
    t.equal(xhr.responseText, "OK");
    t.end();
    mock.teardown();
  };
  xhr.send();
}));

test("should allow registering a specific URL handler", m(t => {
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
    t.end();
  };
  xhr.send();
}));

// test("should allow registering a handler with URL regexp", m(t => {
//   mock.post(/\/a\/\d+/, (req, res) => {
//     return res
//       .status(200)
//       .body(req.url().split("/")[2]);
//   });

//   const xhr = new XMLHttpRequest();
//   xhr.open("POST", "/a/123");
//   xhr.onload = () => {
//     t.equal(xhr.responseText, "123");
//     t.end();
//   };
//   xhr.send();
// }));

// test("should support POST method", m(t => {
//   mock.post("/foo/123", (req, res) => res.body("123"));

//   const xhr = new XMLHttpRequest();
//   xhr.open("POST", "/foo/123");
//   xhr.onload = () => {
//     t.equal(xhr.responseText, "123");
//     t.end();
//   };
//   xhr.send();
// }));

// test("should support PUT method", m(t => {
//   mock.put("/foo/123", (req, res) => res.body("123"));

//   const xhr = new XMLHttpRequest();
//   xhr.open("PUT", "/foo/123");
//   xhr.onload = () => {
//     t.equal(xhr.responseText, "123");
//     t.end();
//   };
//   xhr.send();
// }));

// test("should support PATCH method", m(t => {
//   mock.patch("/foo/123", (req, res) => res.body("123"));

//   const xhr = new XMLHttpRequest();
//   xhr.open("PATCH", "/foo/123");
//   xhr.onload = () => {
//     t.equal(xhr.responseText, "123");
//     t.end();
//   };
//   xhr.send();
// }));

// test("should support DELETE method", m(t => {
//   mock.delete("/foo/123", (req, res) => res.body("123"));

//   const xhr = new XMLHttpRequest();
//   xhr.open("DELETE", "/foo/123");
//   xhr.onload = () => {
//     t.equal(xhr.responseText, "123");
//     t.end();
//   };
//   xhr.send();
// }));

// test("should call error callback", m(t => {
//   mock.get("/foo", (req, res) => null);

//   const xhr = new XMLHttpRequest();
//   xhr.addEventListener("error", ev => {
//     t.equal(ev instanceof MockProgressEvent, true);
//     t.equal(ev.type, "error");
//     t.end();
//   });
//   xhr.open("GET", "/foo");
//   xhr.send();
// }));

// test("should call onreadystatechange callback", m(t => {
//   mock.get("/foo", (req, res) => null);

//   const xhr = new XMLHttpRequest();
//   xhr.onreadystatechange = ev => {
//     t.equal(ev instanceof MockProgressEvent, false);
//     t.equal(ev.type, "readystatechange");
//     t.end();
//   };
//   xhr.open("GET", "/foo");
//   xhr.send();
// }));

// test("should call loadend callback", m(t => {
//   mock.get("/foo", (req, res) => null);

//   const xhr = new XMLHttpRequest();
//   xhr.addEventListener("loadend", ev => {
//     t.equal(ev instanceof MockProgressEvent, true);
//     t.equal(ev.type, "loadend");
//     t.end();
//   });
//   xhr.open("GET", "/foo");
//   xhr.send();
// }));

// test("should call load callback", m(t => {
//   mock.get("/foo", (req, res) => res.body("foo"));

//   const xhr = new XMLHttpRequest();
//   xhr.addEventListener("load", ev => {
//     t.equal(ev instanceof MockProgressEvent, true);
//     t.equal(ev.type, "load");
//     t.end();
//   });
//   xhr.open("GET", "/foo");
//   xhr.send();
// }));

// test("should call timeout callback", m(t => {
//   mock.get("/foo", (req, res) => res.timeout(true));

//   const xhr = new XMLHttpRequest();
//   xhr.addEventListener("timeout", ev => {
//     t.equal(ev instanceof MockProgressEvent, true);
//     t.equal(ev.type, "timeout");
//     t.end();
//   });
//   xhr.open("GET", "/foo");
//   xhr.send();
// }));

// test("should call abort callback", m(t => {
//   mock.get("/foo", (req, res) => res.timeout(100));

//   const xhr = new XMLHttpRequest();
//   xhr.addEventListener("abort", ev => {
//     t.equal(ev instanceof MockProgressEvent, true);
//     t.equal(ev.type, "abort");
//     t.end();
//   });
//   xhr.open("GET", "/foo");
//   xhr.send();
//   xhr.abort();
// }));

// test("should call loadstart callback", m(t => {
//   mock.get("/foo", (req, res) => res.body("hello"));

//   const xhr = new XMLHttpRequest();
//   xhr.addEventListener("loadstart", ev => {
//     t.equal(ev instanceof MockProgressEvent, true);
//     t.equal((ev as MockProgressEvent).loaded, 0);
//     t.equal((ev as MockProgressEvent).total, 0);
//     t.equal(ev.type, "loadstart");
//     t.end();
//   });
//   xhr.open("GET", "/foo");
//   xhr.send();
// }));
