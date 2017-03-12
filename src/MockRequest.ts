import * as URL from "url";
import MockXMLHttpRequest from "./MockXMLHttpRequest";

/** The mocked request data */
export default class MockRequest {
  private _xhr: MockXMLHttpRequest;
  private _method: string;
  private _url: string;
  private _body: string;
  private _headers: any;

  constructor(xhr: any) {
    this._xhr = xhr;
    this._method = xhr.method;
    this._url = xhr.url;
    this._headers = {};
    this.headers(xhr._requestHeaders);
    this.body(xhr.data);
  }

  /** Get the HTTP method */
  method(): string {
    return this._method;
  }

  /** Get the HTTP URL */
  url(): string {
    return this._url;
  }

  /** Get the parsed URL query */
  query() {
    const parsed = URL.parse(this._url, true).query;

    Object.keys(parsed).forEach(key => {
      if (!isNaN(parsed[key])) {
        parsed[key] = Number(parsed[key]);
      }
    });

    return parsed;
  }

  /** Get a HTTP Header */
  header(name: string): string;
  /** Set a HTTP Header */
  header(name: string, value: string): void;
  header(name: string, value?: string): string | void | MockRequest {
    if (typeof value === "undefined") {
      return this._headers[name.toLowerCase()] || null;
    }

    this._headers[name.toLowerCase()] = value;
    return this;
  }

  /** Set all of the HTTP headers */
  headers(headers: object): MockRequest;
  /** Get all of the HTTP headers */
  headers(): object;
  headers(headers?: any): object | MockRequest {
    if (typeof headers === "undefined") {
      return this._headers;
    }
    Object.keys(headers).forEach(key => this.header(key, headers[key]));
    return this;
  }

  /** Get the HTTP body */
  body(): string;
  /** Set the HTTP body */
  body(body: string): MockRequest;
  body(body?: string): string | MockRequest {
    if (typeof body === "undefined") {
      return this._body;
    }

    this._body = body;
    return this;
  }

  /** Trigger progress event */
  progress(loaded: number, total?: number, lengthComputable?: boolean): void {
    this._xhr.trigger("progress", {
      lengthComputable: lengthComputable || true,
      loaded,
      total,
    });
  }
}
