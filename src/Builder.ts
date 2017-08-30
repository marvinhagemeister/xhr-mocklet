import MockXMLHttpRequest from "./MockXMLHttpRequest";
import MockRequest from "./MockRequest";
import MockResponse from "./MockResponse";
import * as window from "global";

const real = (window as any).XMLHttpRequest;

export type UrlMatcher = string | RegExp;
export type MockCallback = (req?: MockRequest, res?: MockResponse) => MockResponse | null;

export class Builder {
  XMLHttpRequest = new MockXMLHttpRequest();

  /** Replace the native XHR with the mocked XHR */
  setup() {
    (window as any).XMLHttpRequest = MockXMLHttpRequest;
    return this.reset();
  }

  /** Replace the mocked XHR with the native XHR and remove any handlers */
  teardown() {
    (window as any).XMLHttpRequest = real;
    return this.reset();
  }

  /** Remove any handlers */
  reset() {
    MockXMLHttpRequest.reset();
    return this;
  }

  /** Mock a requests */
  mock(fn: MockCallback): this;
  mock(method: string, url: UrlMatcher, fn: MockCallback): this;
  mock(method: string | MockCallback, url?: UrlMatcher, fn?: MockCallback): this {
    let handler: MockCallback;

    if (typeof url !== "undefined") {
      const matcher = (req: MockRequest) => {
        if (req.method() !== method) {
          return false;
        }
        const reqUrl = req.url();

        if (url instanceof RegExp) {
          return url.test(reqUrl);
        }

        // otherwise assume the url is a string
        return url === reqUrl;
      };
      handler = (req, res) => {
        if (matcher(req)) {
          return fn(req, res);
        }
        return res;
      };
    } else if (typeof method === "function") {
      handler = method;
    } else {
      handler = (req, res) => res;
    }

    MockXMLHttpRequest.addHandler(handler);

    return this;
  }

  /** Mock a GET request */
  get(url: UrlMatcher, fn: MockCallback) {
    return this.mock("GET", url, fn);
  }

  /** Mock a POST request */
  post(url: UrlMatcher, fn: MockCallback) {
    return this.mock("POST", url, fn);
  }

  /** Mock a PUT request */
  put(url: UrlMatcher, fn: MockCallback) {
    return this.mock("PUT", url, fn);
  }

  /** Mock a PATCH request */
  patch(url: UrlMatcher, fn: MockCallback) {
    return this.mock("PATCH", url, fn);
  }

  /** Mock a DELETE request */
  delete(url: UrlMatcher, fn: MockCallback) {
    return this.mock("DELETE", url, fn);
  }
}

export default new Builder();
