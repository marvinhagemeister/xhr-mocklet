import { assert as t } from "chai";
import MockXMLHttpRequest from "../MockXMLHttpRequest";

describe("MockXMLHttpRequest", () => {
  beforeEach(() => {
    MockXMLHttpRequest.reset();
  });

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
      xhr.open("/");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send();
    });
  });

  describe("open()", () => {
    it("should be OPENED", () => {
      const xhr = new MockXMLHttpRequest();
      xhr.open("/");
      t.equal(xhr.readyState, MockXMLHttpRequest.OPENED);
    });
  });

  describe("send()", () => {
    it("should have a request body", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        t.equal(req.body(), "Hello World!");
        done();
      });

      const xhr = new MockXMLHttpRequest();
      xhr.open("/");
      xhr.send("Hello World!");
    });

    it("should not have a request body", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        t.equal(req.body(), null);
        done();
      });

      const xhr = new MockXMLHttpRequest();
      xhr.open("/");
      xhr.send();
    });

    it("should time out after 100ms", done => {
      let start: any;
      let end: any;

      MockXMLHttpRequest.addHandler((req, res) => {
        return res.timeout(true);
      });

      const xhr = new MockXMLHttpRequest();
      xhr.timeout = 100;
      xhr.open("/");
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
      xhr.open("/");

      let start: any;
      let end: any;
      xhr.ontimeout = () => {
        end = Date.now();
        t.isTrue(end - start >= 100);
        t.equal(xhr.readyState, MockXMLHttpRequest.DONE);
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
      xhr.open("/");
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
      xhr.open("/");
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
      xhr.open("/");
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
      xhr.addEventListener("load", (event: any) => {
        t.equal(event.currentTarget, xhr);
        t.equal(event.type, "load");
        t.equal(this, xhr);
        done();
      });
      xhr.open("/");
      xhr.send();
    });

    it("should allow registering abort event listener", done => {
      MockXMLHttpRequest.addHandler((req, res) => res);

      const xhr = new MockXMLHttpRequest();
      xhr.addEventListener("abort", (event: any) => {
        t.equal(event.currentTarget, xhr);
        t.equal(this, xhr);
        done();
      });
      xhr.open("/");
      xhr.send();
      xhr.abort();
    });

    it("should allow registering progress event listener", done => {
      MockXMLHttpRequest.addHandler((req, res) => {
        req.progress(50, 100);
        return res;
      });

      const xhr = new MockXMLHttpRequest();
      xhr.addEventListener("progress", (event: any) => {
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

      const xhr = new MockXMLHttpRequest();
      const cb = () => done();

      xhr.addEventListener("load", cb);
      xhr.addEventListener("load", cb);
      xhr.removeEventListener("load", cb);
      xhr.open("/");
      xhr.send();
    });
  });
});
