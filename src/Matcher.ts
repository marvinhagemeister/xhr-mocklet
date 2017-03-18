import { RequestHandler } from "./Registry";
import MockResponse, { IMockResponseData } from "./MockResponse";
import { RequestData } from "./MockRequest";

export const match = (method: string, url: string | RegExp) => (req: RequestData): boolean => {
  if (req.method !== method) {
    return false;
  }

  const reqUrl = req.url;
  if (url instanceof RegExp) {
    return url.test(reqUrl);
  }

  return url === reqUrl;
};

export const createHandler = (method: string, url: string | RegExp, handler: RequestHandler) => {
  const matcher = match(method, url);
  return (req: RequestData, res: MockResponse): Partial<IMockResponseData> => {
    if (matcher(req)) {
      return handler(req, res).build();
    }

    return {};
  };
};
