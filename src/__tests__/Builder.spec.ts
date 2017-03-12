import { assert as t } from "chai";
import * as sinon from "sinon";
import * as window from "global";
import mock from "../Builder";

const noop = (res: any) => res;

describe("Builder", () => {
  it("should setup and teardown the mock XMLHttpRequest class", () => {
    const xhr = (window as any).XMLHttpRequest;
    mock.setup();
    t.notEqual((window as any).XMLHttpRequest, xhr);
    mock.teardown();
    t.equal((window as any).XMLHttpRequest, xhr);
  });

  it("should remove any handlers", () => {
    mock.get("http://www.google.com/", noop);
    mock.setup();
    t.equal(mock.XMLHttpRequest.handlers.length, 0);
    mock.get("http://www.google.com/", noop);
    mock.teardown();
    t.equal(mock.XMLHttpRequest.handlers.length, 0);
  });

  describe("mock()", () => {
    beforeEach(() => mock.setup());
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
  });
});
