import { assert as t } from "chai";
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
    it("should allow registering the handler", done => {
      mock.setup();

      mock.mock((req, res) => res
        .status(200)
        .body("OK"));

      const xhr = new XMLHttpRequest();
      xhr.open("GET", "/");
      xhr.onload = () => {
        t.equal(xhr.responseText, "OK");
        mock.teardown();
        done();
      };
      xhr.send();
    });

    it("should allow registering a specific URL handler", done => {
      mock.setup();

      mock.mock("GET", "/a", (req, res) => {
        return res
          .status(200)
          .body("A")
          ;
      });

      mock.mock("GET", "/b", (req, res) => {
        return res
          .status(200)
          .body("B")
          ;
      });

      const xhr = new XMLHttpRequest();
      xhr.open("GET", "/a");
      xhr.onload = () => {
        t.equal(xhr.responseText, "A");
        mock.teardown();
        done();
      };
      xhr.send();
    });

    it("should allow registering a handler with URL regexp", done => {
      mock.setup();

      mock.mock("POST", /\/a\/\d+/, (req, res) => {
        return res
          .status(200)
          .body(req.url().split("/")[2])
          ;
      });

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/a/123");
      xhr.onload = () => {
        t.equal(xhr.responseText, "123");
        mock.teardown();
        done();
      };
      xhr.send();
    });
  });
});
