import MockXMLHttpRequest from "./MockXMLHttpRequest";
import MockResponse, { IMockResponseData } from "./MockResponse";
import MockRequest from "./MockRequest";
import { HTTP_METHODS } from "./utils/index";

export type RequestHandler = (req: MockRequest, res: MockResponse) => MockResponse;

export interface IRequestRegistry {
  [key: string]: RequestHandler[];
}

export default class Registry {
  public handlers: RequestHandler[];

  handle(xhr: MockXMLHttpRequest): IMockResponseData {
    const request = new MockRequest(xhr);

    const responses = this.handlers
      .map(handler => handler(request, new MockResponse()))
      .filter(res => typeof res !== "undefined")
      .map(res => res);

    return Object.assign({}, ...responses);
  }

  add(handler: RequestHandler): void {
    this.handlers.push(handler);
  }

  remove(handler: RequestHandler): void {
    this.handlers.filter(fn => fn !== handler);
  }

  reset() {
    this.handlers = [];
  }
}
