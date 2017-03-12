import MockXMLHttpRequest from "./MockXMLHttpRequest";
import MockRequest from "./MockRequest";
import MockResponse from "./MockResponse";
import * as window from "global";

const real = (window as any).XMLHttpRequest;

export type MockCallback = (req?: MockRequest, res?: MockResponse) => MockResponse;

export class Builder {
  XMLHttpRequest = new MockXMLHttpRequest();

  /** Replace the native XHR with the mocked XHR */
  setup(): Builder {
    (window as any).XMLHttpRequest = MockXMLHttpRequest;
    return this.reset();
  }

  /** Replace the mocked XHR with the native XHR and remove any handlers */
  teardown() {
    (window as any).XMLHttpRequest = real;
    return this.reset();
  }

  /** Remove any handlers */
  reset(): Builder {
    MockXMLHttpRequest.reset();
    return this;
  }

  /** Mock a requests */
  mock(fn: (req?: MockRequest, res?: MockResponse) => MockResponse): Builder;
  mock(method: string, url?: string | RegExp, fn?: MockCallback): Builder;
  mock(method: string | MockCallback, url?: string | RegExp, fn?: MockCallback): Builder {
    let handler: any;

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
      handler = (req: MockRequest, res: MockResponse) => {
        if (matcher(req)) {
          return fn(req, res);
        }
        return false;
      };
    } else {
      handler = method;
    }

    MockXMLHttpRequest.addHandler(handler);

    return this;
  }

  /** Mock a GET request */
  get(url: string | RegExp, fn: (req?: MockRequest, res?: MockResponse) => MockResponse): Builder {
    return this.mock("GET", url, fn);
  }

  /** Mock a POST request */
  post(url: string | RegExp, fn: (req?: MockRequest, res?: MockResponse) => MockResponse): Builder {
    return this.mock("POST", url, fn);
  }

  /** Mock a PUT request */
  put(url: string | RegExp, fn: (req?: MockRequest, res?: MockResponse) => MockResponse): Builder {
    return this.mock("PUT", url, fn);
  }

  /** Mock a PATCH request */
  patch(url: string | RegExp, fn: (req?: MockRequest, res?: MockResponse) => MockResponse): Builder {
    return this.mock("PATCH", url, fn);
  }

  /** Mock a DELETE request */
  delete(url: string | RegExp, fn: (req?: MockRequest, res?: MockResponse) => MockResponse): Builder {
    return this.mock("DELETE", url, fn);
  }
}

export default new Builder();
