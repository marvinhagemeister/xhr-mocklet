import { RequestHandler } from "./Registry";
import MockResponse, { IMockResponseData } from "./MockResponse";
import MockRequest from "./MockRequest";

export const match = (method: string, url: string | RegExp) => (req: MockRequest): boolean => {
  if (req.method() !== method) {
    return;
  }

  const reqUrl = req.url();
  if (url instanceof RegExp) {
    return url.test(reqUrl);
  }

  return url === reqUrl;
};

export const createHandler = (method: string, url: string | RegExp, handler: RequestHandler) => {
  const matcher = match(method, url);
  return (req: MockRequest, res: MockResponse): Partial<IMockResponseData> => {
    if (matcher(req)) {
      return handler(req, res).build();
    }

    return {};
  };
};
