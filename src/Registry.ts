import MockXMLHttpRequest from "./MockXMLHttpRequest";
import MockResponse, { IMockResponseData } from "./MockResponse";
import { RequestData, xhrToRequest } from "./MockRequest";
import { HTTP_METHODS } from "./utils/index";

export type RequestHandler = (req: RequestData, res: MockResponse) => MockResponse;
export type StrictRequestHandler = (req: RequestData, res: MockResponse) => Partial<IMockResponseData>;

export default class Registry {
  public handlers: StrictRequestHandler[] = [];

  handle(xhr: MockXMLHttpRequest): IMockResponseData {
    const request = xhrToRequest(xhr);

    const responses = this.handlers
      .map(handler => handler(request, new MockResponse()))
      .filter(res => typeof res !== "undefined")
      .map(res => res);

    return Object.assign({}, ...responses);
  }

  add(handler: StrictRequestHandler): void {
    this.handlers.push(handler);
  }

  remove(handler: StrictRequestHandler): void {
    this.handlers = this.handlers.filter(fn => fn !== handler);
  }

  reset() {
    this.handlers = [];
  }
}
