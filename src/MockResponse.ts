/** The mocked response data */
export default class MockResponse {
  private _status: number;
  private _headers: any;
  private _body: string;
  private _timeout: number;

  constructor() {
    this._status = 200;
    this._headers = {};
    this._body = "";
    this._timeout = 0;
  }

  /** Get the HTTP status */
  status(): number;
  /** Set the HTTP status */
  status(code: number): MockResponse;
  status(code?: number): number | MockResponse {
    if (typeof code === "undefined") {
      return this._status;
    }

    this._status = code;
    return this;
  }

  /** Get a HTTP header */
  header(name: string): string | undefined;
  /** Set a HTTP header */
  header(name: string, value: string): MockResponse
  header(name: string, value?: string): string | undefined | MockResponse {
    if (typeof value === "undefined") {
      return this._headers[name.toLowerCase()] || null;
    }

    this._headers[name.toLowerCase()] = value;
    return this;
  }

  /** Get all of the HTTP headers */
  headers(): object;
  /** Set all of the HTTP headers */
  headers(headers: object): MockResponse;
  headers(headers?: object): object | MockResponse {
    if (typeof headers === "undefined") {
      return this._headers;
    }

    Object.keys(headers).forEach(key => this.header(key, (headers as any)[key]));
    return this;
  }

  /** Get the HTTP body */
  body(): string;
  /** Set the HTTP body */
  body(body: string | object): MockResponse;
  body(body?: string | object): string | MockResponse {
    if (typeof body === "undefined") {
      return this._body;
    }

    if (typeof body === "object") {
      body = JSON.stringify(body);
    }

    this._body = body;
    return this;
  }

  /** Get the HTTP timeout */
  timeout(): number;
  /** Set the HTTP timeout */
  timeout(timeout: number | boolean): MockResponse;
  timeout(timeout?: number | boolean): number | MockResponse {
    if (typeof timeout === "undefined") {
      return this._timeout;
    }

    this._timeout = typeof timeout === "number"
      ? timeout
      : 0;
    return this;
  }
}
