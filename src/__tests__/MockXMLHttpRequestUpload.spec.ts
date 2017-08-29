import { assert as t } from "chai";
import * as sinon from "sinon";
import MockXMLHttpRequest from "../MockXMLHttpRequest";
import MockProgressEvent from "../polyfill/MockProgressEvent";

/* tslint:disable only-arrow-functions */

describe("MockXMLHttpRequestUpload", () => {
  afterEach(() => {
    MockXMLHttpRequest.reset();
  });

  describe("addEventListener()", () => {
    it("should allow registering progress event listener", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        req.progress(50, 100);
        return res;
      });

      const xhr = new MockXMLHttpRequest();
      xhr.upload.addEventListener("progress", event => {
        t.equal(event instanceof MockProgressEvent, true);
        t.equal(event.type, "progress");
        t.equal(event.lengthComputable, true);
        t.equal(event.loaded, 50);
        t.equal(event.total, 100);
        done();
      });
      xhr.open("/");
      xhr.send();
    });

    it("should allow unregistering event listener", done => {
      MockXMLHttpRequest.addHandler((req, res) => res);
      const spy = sinon.spy();

      const xhr = new MockXMLHttpRequest();
      const cb = () => done();

      xhr.upload.addEventListener("progress", spy);
      xhr.upload.removeEventListener("progress", spy);
      xhr.open("/");
      xhr.send();

      setTimeout(() => {
        t.equal(spy.callCount, 0);
        done();
      }, 5);
    });
  });
});
