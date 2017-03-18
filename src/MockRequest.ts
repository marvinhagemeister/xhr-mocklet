import * as URL from "url";
import MockXMLHttpRequest from "./MockXMLHttpRequest";
import MockProgressEvent from "./polyfill/MockProgressEvent";

export interface RequestData {
  method: string;
  url: string;
  body: any;
  headers: {
    [name: string]: string;
  };
}

export function createRequest(): RequestData {
  return {
    body: undefined,
    headers: {},
    method: "GET",
    url: "",
  };
}

export function xhrToRequest(xhr: MockXMLHttpRequest): RequestData {
  // TODO: parse from xhr
  return {
    body: "foo",
    headers: {},
    method: xhr.method,
    url: xhr.url,
  };
}
