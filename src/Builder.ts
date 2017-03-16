import MockXMLHttpRequest from "./MockXMLHttpRequest";
import MockRequest from "./MockRequest";
import MockResponse from "./MockResponse";
import { RequestHandler } from "./Registry";
import { createHandler } from "./Matcher";

export interface EnvTarget extends Object {
  XMLHttpRequest?: any;
}

export class Builder {
  XMLHttpRequest = new MockXMLHttpRequest();

  private _real: any;
  private _target: any;

  /** Replace the native XHR with the mocked XHR */
  setup(target: EnvTarget): Builder {
    this._real = target.XMLHttpRequest;
    target.XMLHttpRequest = MockXMLHttpRequest;
    this._target = target;
    return this.reset();
  }

  /** Replace the mocked XHR with the native XHR and remove any handlers */
  teardown() {
    this._target.XMLHttpRequest = this._real;
    return this.reset();
  }

  /** Remove any handlers */
  reset(): Builder {
    this.XMLHttpRequest.registry.reset();
    return this;
  }

  /** Mock a requests */
  mock(fn: RequestHandler): Builder;
  mock(method: string, url?: string | RegExp, fn?: RequestHandler | string | number | object): Builder;
  mock(method: string | RequestHandler, url?: string | RegExp, fn?: RequestHandler): Builder {
    if (typeof fn !== "function") {
      fn = (req: MockRequest, res: MockResponse) => res.body(fn);
    }

    const handler = typeof method !== "function"
      ? createHandler(method, url, fn)
      : method;

    this.XMLHttpRequest.registry.add(handler);

    return this;
  }

  /** Mock a GET request */
  get(url: string | RegExp, fn: RequestHandler | string | number | object): Builder {
    return this.mock("GET", url, fn);
  }

  /** Mock a POST request */
  post(url: string | RegExp, fn: RequestHandler | string | number | object): Builder {
    return this.mock("POST", url, fn);
  }

  /** Mock a PUT request */
  put(url: string | RegExp, fn: RequestHandler | string | number | object): Builder {
    return this.mock("PUT", url, fn);
  }

  /** Mock a PATCH request */
  patch(url: string | RegExp, fn: RequestHandler | string | number | object): Builder {
    return this.mock("PATCH", url, fn);
  }

  /** Mock a DELETE request */
  delete(url: string | RegExp, fn: RequestHandler | string | number | object): Builder {
    return this.mock("DELETE", url, fn);
  }
}

export default new Builder();
