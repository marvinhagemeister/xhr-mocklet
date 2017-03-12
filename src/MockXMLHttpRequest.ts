import MockResponse from "./MockResponse";
import MockRequest from "./MockRequest";

/* tslint:disable ban-types */

const notImplementedError = new Error(
  "This feature hasn't been implmented yet. Please submit an Issue or Pull Request on Github.",
);

export default class MockXMLHttpRequest {
  static UNSENT = 0;
  static OPENED = 1;
  static HEADERS_RECEIVED = 2;
  static LOADING = 3;
  static DONE = 4;

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
  public responseXML: string;
  public response: string;
  public readyState: number;
  public onreadystatechange: undefined | Function;
  public timeout = 0;

  // Events
  public onabort: Function;
  public onerror: Function;
  public onload: Function;
  public onloadend: Function;
  public onloadstart: Function;
  public onprogress: Function;
  public ontimeout: Function;

  private _eventListeners: any[] = [];
  private _sendTimeout: any;
  private _requestHeaders: any;
  private _responseHeaders: any;

  constructor() {
    this.reset();
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

    this.readyState = MockXMLHttpRequest.UNSENT;
  }

  /** Trigger an event */
  trigger(event: string, eventDetails?: any): MockXMLHttpRequest {
    if (this.onreadystatechange) {
      this.onreadystatechange();
    }

    if ((this as any)["on" + event]) {
      (this as any)["on" + event]();
    }

    for (const listener of this._eventListeners) {
      if (listener.event === event) {
        const details = eventDetails || {};
        details.currentTarget = this;
        details.type = event;
        listener.listener.call(this, details);
      }
    }

    return this;
  }

  open(method: string, url?: string, async?: boolean, user?: string, password?: string): void {
    this.reset();
    this.readyState = MockXMLHttpRequest.OPENED;
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
    this.readyState = MockXMLHttpRequest.LOADING;
    this.data = data;

    this._sendTimeout = setTimeout(() => {
      const response = MockXMLHttpRequest.handle(new MockRequest(this));

      if (response && response instanceof MockResponse) {
        let timeout = response.timeout();
        timeout = typeof timeout === "number"
          ? timeout
          : this.timeout + 1;

        if (timeout) {
          // trigger a timeout event because the request timed timeout
          // - wait for the timeout time because many libs like jquery
          // and superagent use setTimeout to detect the error type
          this._sendTimeout = setTimeout(() => {
            this.readyState = MockXMLHttpRequest.DONE;
            this.trigger("timeout");
          }, timeout);
        } else {
          // map the response to the XHR object
          this.status = response.status();
          this._responseHeaders = response.headers();
          this.responseType = "text";
          this.response = response.body();
          this.responseText = response.body(); // TODO: detect an object and return JSON, detect XML and return XML
          this.readyState = MockXMLHttpRequest.DONE;

          // trigger a load event because the request was received
          this.trigger("load");
        }
      } else {
        // trigger an error because the request was not handled
        this.readyState = MockXMLHttpRequest.DONE;
        this.trigger("error");
      }
    }, 0);
  }

  abort(): void {
    clearTimeout(this._sendTimeout);

    if (this.readyState > MockXMLHttpRequest.UNSENT &&
      this.readyState < MockXMLHttpRequest.DONE
    ) {
      this.readyState = MockXMLHttpRequest.UNSENT;
      this.trigger("abort");
    }
  }

  getAllResponseHeaders(): null | string {
    if (this.readyState < MockXMLHttpRequest.HEADERS_RECEIVED) {
      return null;
    }

    return Object.keys(this._responseHeaders)
      .map(key => name + ": " + this._responseHeaders[key] + "\n")
      .join("");
  }

  getResponseHeader(name: string): null | string {
    if (this.readyState < MockXMLHttpRequest.HEADERS_RECEIVED) {
      return null;
    }

    return this._responseHeaders[name.toLowerCase()] || null;
  }

  addEventListener(event: string, listener: Function) {
    this._eventListeners.push({
      listener,
      event,
    });
  }

  removeEventListener(event: string, listener: Function) {
    let currentIndex = 0;

    while (currentIndex < this._eventListeners.length) {
      const eventListener = this._eventListeners[currentIndex];
      if (eventListener.event === event && eventListener.listener === listener) {
        this._eventListeners.splice(currentIndex, 1);
      } else {
        currentIndex++;
      }
    }
  }
}
