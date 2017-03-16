import * as URL from "url";
import MockResponse from "./MockResponse";
import MockRequest from "./MockRequest";
import MockProgressEvent from "./polyfill/MockProgressEvent";
import MockEvent from "./polyfill/MockEvent";
import Registry from "./Registry";
import {
  BAD_HEADER_NAMES,
  HTTP_METHODS,
  HTTP_METHOD_OUTDATED,
  inProgressError,
  mainThreadError,
  notImplementedError,
} from "./utils/index";

/* tslint:disable ban-types */

// The Spec is really well written and can be viewed at
// https://xhr.spec.whatwg.org/ . I just wish that it would
// not rely so much on internal state. It's a mess to
// write tests for...

const createEvent = (options: any, target: any, type: string) => {
  const hasProgress = ["error", "progress", "loadstart", "loadend", "load",
    "timeout", "abort"];

  let event;
  if (hasProgress.indexOf(type) > -1) {
    event = new MockProgressEvent(type, {
      lengthComputable: true,
      loaded: options && options.loaded || 0,
      total: options && options.total || 0,
    });
  } else {
    event = new MockEvent(type);
  }

  (event as any).currentTarget = target;
  (event as any).target = target;

  return event;
};

export default class MockXMLHttpRequest implements XMLHttpRequest {
  public static readonly UNSENT = 0;
  public static readonly OPENED = 1;
  public static readonly HEADERS_RECEIVED = 2;
  public static readonly LOADING = 3;
  public static readonly DONE = 4;

  // Somehow they are both defined on the instance and static method
  public readonly UNSENT = 0;
  public readonly OPENED = 1;
  public readonly HEADERS_RECEIVED = 2;
  public readonly LOADING = 3;
  public readonly DONE = 4;

  public status: number;
  public statusText: string;
  public method: string;
  public url: string;
  public user: string;
  public password: string;
  public data: string;
  public async: boolean = true;
  public reponse: string;

  // Spec: https://xhr.spec.whatwg.org/#the-responsetext-attribute
  get responseText() {
    if (["", "text"].indexOf(this._responseType) === -1) {
      throw new Error("InvalidStateError: Cannot get responseText for none text response");
    } else if (this.readyState < MockXMLHttpRequest.LOADING) {
      return "";
    }

    return this._responseText;
  }

  // Spec: https://xhr.spec.whatwg.org/#the-responsetype-attribute
  get responseType() {
    return this._responseType;
  }

  set responseType(value: "" | "arraybuffer" | "blob" | "document" | "json" | "text") {
    if (this.readyState >= MockXMLHttpRequest.LOADING) {
      throw new Error(inProgressError);
    }

    this._responseType = value;
  }

  public responseXML: Document;
  public responseURL: string;
  public response: string;
  // FIXME: NOT IMPLEMENTED
  public upload: XMLHttpRequestUpload;
  public readyState: number = MockXMLHttpRequest.UNSENT;
  public onreadystatechange: (this: XMLHttpRequest, ev: Event) => any;
  public msCachingEnabled: () => boolean;

  get timeout() {
    return this._timeout;
  }

  set timeout(ms: number) {
    if (!this.async) {
      throw new Error(mainThreadError);
    }

    this._timeout = ms;
  }

  // some libraries (like Mixpanel) use the presence of this field to check
  // if XHR is properly supported. See
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
  get withCredentials() {
    return this._withCredentials;
  }

  // Spec https://xhr.spec.whatwg.org/#dom-xmlhttprequest-withcredentials
  set withCredentials(include: boolean) {
    if (this.readyState > MockXMLHttpRequest.OPENED || this._isSent) {
      throw new Error(inProgressError);
    }

    this._withCredentials = include;
  }

  public registry: Registry;

  // Events
  public onabort: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any;
  public onerror: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  public onload: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any;
  public onloadend: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any;
  public onloadstart: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any;
  public onprogress: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any;
  public ontimeout: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any;

  private _responseText: string;
  private _responseType: "" | "arraybuffer" | "blob" | "document" | "json" | "text" = "";
  private _timeout: number = 0;
  private _withCredentials: boolean = false;

  private _events: any[] = [];
  private _sendTimeout: any;
  private _requestHeaders: any;
  private _responseHeaders: any;

  private _isSent: boolean = false;

  constructor(registry: Registry = new Registry()) {
    this.registry = registry;
    this.reset();
  }

  dispatchEvent(evt: Event): boolean {
    throw new Error(notImplementedError);
  }

  /** Reset the response values */
  reset() {
    this._requestHeaders = {};
    this._responseHeaders = {};

    this.status = 200;
    this.statusText = "";

    this.response = null;
    this._responseType = null;
    this._responseText = null;
    this.responseXML = null;

    this.readyState = MockXMLHttpRequest.UNSENT;
  }

  /** Trigger an event */
  trigger(type: string, options?: any): MockXMLHttpRequest {
    if (this.onreadystatechange) {
      this.onreadystatechange.call(this, createEvent(options, this, "readystatechange"));
    }

    const hasEvent = this._events.find(item => item.type === "loadend");
    if (this.readyState === MockXMLHttpRequest.DONE &&
      (this.onloadend || hasEvent)) {
      let listener;
      if (this.onloadend) {
        listener = this.onloadend;
      } else if (typeof hasEvent !== "undefined") {
        listener = hasEvent.listener;
      }

      if (typeof listener !== "undefined") {
        listener.call(this, createEvent(options, this, "loadend"));
      }
    }

    if (typeof (this as any)["on" + type] === "function") {
      (this as any)["on" + type].call(this, createEvent(options, this, type));
    }

    for (const event of this._events) {
      if (event.type === type) {
        event.listener.call(this, createEvent(options, this, type));
      }
    }

    return this;
  }

  // Spec: https://xhr.spec.whatwg.org/#the-open%28%29-method
  open(
    method: string,
    url: string,
    async: boolean = true,
    user: string = null,
    password: string = null,
  ): void {
    // Throw on outdated HTTP methods
    if (HTTP_METHOD_OUTDATED.indexOf(method.toUpperCase()) > -1) {
      throw new Error("Security Error: HTTP method must not be \"" + method + "\"");
    }

    // Parse method
    if (HTTP_METHODS.indexOf(method.toUpperCase()) === -1) {
      throw new SyntaxError("Invalid HTTP method \"" + method + "\"");
    }

    // Parse url
    try {
      URL.parse(url);
    } catch (e) {
      throw new SyntaxError("Invalid HTTP url \"" + url + "\"");
    }

    // Throw if async = false && timeout != 0 && responseType != ''.
    if (!async && this.timeout > 0 && this.responseType !== "") {
      throw new Error(mainThreadError);
    }

    this.reset();
    this.url = url;
    this.async = async;
    this.user = user;
    this.password = password;

    this._isSent = false;
    this.data = null;
    this.method = method.toUpperCase().trim();
    this.readyState = MockXMLHttpRequest.OPENED;
    this.trigger("readystatechange");
  }

  // Spec: https://xhr.spec.whatwg.org/#the-setrequestheader%28%29-method
  setRequestHeader(name: string, value: string) {
    if (this.readyState !== MockXMLHttpRequest.OPENED && this._isSent) {
      throw new Error(inProgressError);
    }

    // TODO: Validate value per spec
    if (BAD_HEADER_NAMES.some((n: string) => n.toUpperCase() === name.toUpperCase())
      || /(Proxy\-|Sec\-)/i.test(name)) {
      throw new Error("Forbidden header name: \"" + name + "\"");
    }

    // Header values are appended to existing ones
    if (typeof this._requestHeaders[name] === "undefined") {
      this._requestHeaders[name] = value;
    } else {
      this._requestHeaders[name] += ", " + value;
    }
  }

  overrideMimeType(mime: string) {
    throw new Error(notImplementedError);
  }

  // Spec: https://xhr.spec.whatwg.org/#the-send%28%29-method
  send(body?: any): void {
    if (this.readyState !== MockXMLHttpRequest.OPENED || this._isSent) {
      throw new Error(inProgressError);
    }

    if (["GET", "HEAD"].indexOf(this.method) > -1) {
      body = null;
    }

    if (body !== null) {
      // TODO: Set mimeType accordingly
    }

    // TODO: Trigger events on .upload if present
    // TODO: unset .upload complete flag
    // TODO: if body is null set .upload complete

    this.readyState = MockXMLHttpRequest.LOADING;
    this.data = body;

    setTimeout(() => {
      this.trigger("loadstart", {
        loaded: 0,
        total: 0,
      });

      // TODO: Fire loadstart on upload

      const response = this.registry.handle(this);

      const timeout = Math.max(response.timeout, this.timeout);
      if (timeout > 0) {
        this._sendTimeout = setTimeout(() => {
          this.readyState = MockXMLHttpRequest.DONE;
          this.trigger("timeout");
          return;
        }, timeout);
      }

      // TODO: fire progress on .upload

      if (response !== null) {
        // map the response to the XHR object
        this.status = response.status;
        this._responseHeaders = response.headers;
        this._responseType = "text";
        this.response = response.body();
        this._responseText = response.body(); // TODO: detect an object and return JSON, detect XML and return XML
        this.readyState = MockXMLHttpRequest.DONE;

        // trigger a load event because the request was received
        this.trigger("loadstart");
        this.trigger("load");
      } else {
        // trigger an error because the request was not handled
        this.readyState = MockXMLHttpRequest.DONE;
        this.trigger("error");
      }
    }, 0);
  }

  abort(): void {
    clearTimeout(this._sendTimeout);

    this.readyState = MockXMLHttpRequest.DONE;
    this._isSent = false;
    this.trigger("onreadystatechange");
    // TODO: .upload

    if (this.readyState > MockXMLHttpRequest.UNSENT &&
      this.readyState < MockXMLHttpRequest.DONE
    ) {
      this.trigger("abort");
    }

    this.readyState = MockXMLHttpRequest.UNSENT;
    this.trigger("loadend", { loaded: 0, total: 0 });
  }

  getAllResponseHeaders(): null | string {
    if (this.readyState < MockXMLHttpRequest.HEADERS_RECEIVED) {
      return null;
    }

    // Yes the spec states \r\n line-breaks...
    return Object.keys(this._responseHeaders)
      .map(key => key + ": " + this._responseHeaders[key] + "\r\n")
      .join("");
  }

  getResponseHeader(name: string): null | string {
    if (this.readyState < MockXMLHttpRequest.HEADERS_RECEIVED) {
      return null;
    }

    return this._responseHeaders[name.toLowerCase()] || null;
  }

  addEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(
    type: K,
    listener: (event?: XMLHttpRequestEventTargetEventMap[K]) => any,
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
