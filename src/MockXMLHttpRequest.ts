import MockResponse from "./MockResponse";
import MockRequest from "./MockRequest";

/* tslint:disable ban-types */

const notImplementedError = new Error(
  "This feature hasn't been implmented yet. Please submit an Issue or Pull Request on Github.",
);

const createEvent = (options: any, target: any, type: string) => {
  const obj = options || {};
  obj.currentTarget = target;
  obj.type = type;
  return obj;
};

export default class MockXMLHttpRequest implements XMLHttpRequest {

  public static handlers: any[] = [];

  /** Add a request handler */
  static addHandler(fn: (req: MockRequest, res: MockResponse) => any): void {
    MockXMLHttpRequest.handlers.push(fn);
  };

  /** Remove a request handler */
  static removeHandler(fn: (req: MockRequest, res: MockRequest) => any): MockXMLHttpRequest {
    throw notImplementedError;
  }

  /** Remove all request handlers */
  static reset(): void {
    this.handlers = [];
  }

  /** Handle a request */
  static handle(req: MockRequest): MockResponse | null {
    for (const handler of MockXMLHttpRequest.handlers) {
      // get the generator to create a response to the request
      const response = handler(req, new MockResponse());
      if (response) {
        return response;
      }
    }

    return null;
  }

  readonly UNSENT = 0;
  readonly OPENED = 1;
  readonly HEADERS_RECEIVED = 2;
  readonly LOADING = 3;
  readonly DONE = 4;

  get handlers() {
    return MockXMLHttpRequest.handlers;
  }

  // some libraries (like Mixpanel) use the presence of this field to check
  // if XHR is properly supported. See
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
  public withCredentials = false;
  public status: number;
  public statusText: string;
  public method: string;
  public url: string;
  public user: string;
  public password: string;
  public data: string;
  public async: boolean;
  public reponse: string;
  public responseText: string;
  public responseType: string;
  public responseXML: Document;
  public responseURL: string;
  public response: string;
  public upload: XMLHttpRequestUpload;
  public readyState: number;
  public onreadystatechange: (this: XMLHttpRequest, ev: Event) => any;
  public timeout = 0;
  public msCachingEnabled: () => boolean;

  // Events
  public onabort: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  public onerror: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  public onload: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  public onloadend: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  public onloadstart: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  public onprogress: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  public ontimeout: (this: XMLHttpRequestEventTarget, ev: Event) => any;

  private _events: any[] = [];
  private _sendTimeout: any;
  private _requestHeaders: any;
  private _responseHeaders: any;

  constructor() {
    this.reset();
  }

  dispatchEvent(evt: Event): boolean {
    throw notImplementedError;
  }

  /** Reset the response values */
  reset() {
    this._requestHeaders = {};
    this._responseHeaders = {};

    this.status = 0;
    this.statusText = "";

    this.response = null;
    this.responseType = null;
    this.responseText = null;
    this.responseXML = null;

    this.readyState = this.UNSENT;
  }

  /** Trigger an event */
  trigger(type: string, options?: any): MockXMLHttpRequest {
    if (this.onreadystatechange) {
      this.onreadystatechange(createEvent(options, this, type));
    }

    if ((this as any)["on" + type]) {
      (this as any)["on" + type]();
    }

    for (const event of this._events) {
      if (event.type === type) {
        event.listener.call(this, createEvent(options, this, type));
      }
    }

    return this;
  }

  open(method: string, url?: string, async?: boolean, user?: string, password?: string): void {
    this.reset();
    this.readyState = this.OPENED;
    this.data = null;

    if (typeof url === "undefined") {
      this.url = method;
    } else {
      this.method = method;
      this.url = url;
      this.async = async;
      this.user = user;
      this.password = password;
    }
  }

  setRequestHeader(name: string, value: string) {
    this._requestHeaders[name] = value;
  }

  overrideMimeType(mime: string) {
    throw notImplementedError;
  }

  send(data?: any): void {
    this.readyState = this.LOADING;
    this.data = data;

    setTimeout(() => {
      const response = MockXMLHttpRequest.handle(new MockRequest(this));
      if (response && typeof response.timeout !== "undefined") {
        const timeout = Math.max(response.timeout(), this.timeout);

        if (timeout > 0) {
          // trigger a timeout event because the request timed timeout
          // - wait for the timeout time because many libs like jquery
          // and superagent use setTimeout to detect the error type
          this._sendTimeout = setTimeout(() => {
            this.readyState = this.DONE;
            this.trigger("timeout");
          }, timeout);
        } else {
          // map the response to the XHR object
          this.status = response.status();
          this._responseHeaders = response.headers();
          this.responseType = "text";
          this.response = response.body();
          this.responseText = response.body(); // TODO: detect an object and return JSON, detect XML and return XML
          this.readyState = this.DONE;

          // trigger a load event because the request was received
          this.trigger("load");
        }
      } else {
        // trigger an error because the request was not handled
        this.readyState = this.DONE;
        this.trigger("error");
      }
    }, 0);
  }

  abort(): void {
    clearTimeout(this._sendTimeout);

    if (this.readyState > this.UNSENT &&
      this.readyState < this.DONE
    ) {
      this.readyState = this.UNSENT;
      this.trigger("abort");
    }
  }

  getAllResponseHeaders(): null | string {
    if (this.readyState < this.HEADERS_RECEIVED) {
      return null;
    }

    // Yes the spec states \r\n line-breaks...
    return Object.keys(this._responseHeaders)
      .map(key => key + ": " + this._responseHeaders[key] + "\r\n")
      .join("");
  }

  getResponseHeader(name: string): null | string {
    if (this.readyState < this.HEADERS_RECEIVED) {
      return null;
    }

    return this._responseHeaders[name.toLowerCase()] || null;
  }

  addEventListener<K extends keyof XMLHttpRequestEventMap>(
    type: K,
    listener: (event?: XMLHttpRequestEventMap[K]) => any,
    useCapture?: boolean,
  ): void {
    this._events.push({
      listener,
      type,
    });
  }

  removeEventListener<K extends keyof XMLHttpRequestEventMap>(
    type: K,
    listener: (event?: XMLHttpRequestEventMap[K]) => any,
  ): void {
    let i = 0;

    while (i < this._events.length) {
      const item = this._events[i];

      if (item.type === type && item.listener === listener) {
        this._events.splice(i, 1);
      } else {
        i++;
      }
    }
  }
}
