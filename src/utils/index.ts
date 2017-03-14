export const mainThreadError = "InvalidAccessError: Synchronous network requests block "
  + "the main thread and are known to have detrimental effects to the end "
  + "user's experience.";

export const notImplementedError =
  "This feature hasn't been implmented yet. Please submit an Issue or Pull Request on Github.";

export const inProgressError = "InvalidStateError: Request already in progress.";

export const BAD_HEADER_NAMES = [
  "Accept-Charset",
  "Accept-Encoding",
  "Access-Control-Request-Headers",
  "Access-Control-Request-Method",
  "Connection",
  "Content-Length",
  "Cookie",
  "Cookie2",
  "Date",
  "DNT",
  "Expect",
  "Host",
  "Keep-Alive",
  "Origin",
  "Referer",
  "TE",
  "Trailer",
  "Transfer-Encoding",
  "Upgrade",
  "Via",
];

export const HTTP_METHOD_OUTDATED = ["CONNECT", "TRACE", "TRACK"];
export const HTTP_METHODS = ["OPTIONS", "GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"];
