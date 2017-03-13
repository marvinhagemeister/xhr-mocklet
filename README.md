# XMLHttpRequest mocking

[![Build Status](https://travis-ci.org/marvinhagemeister/xhr-mocklet.svg?branch=master)](https://travis-ci.org/marvinhagemeister/xhr-mocklet)

Utility for mocking XMLHttpRequests both in the browser and nodejs. It's primary
use case is for unit tests, allowing you to respond with mock responses, trigger
timeouts, etc.

This library comes with complete TypeScript declaration files.

## Installation

```bash
# NPM
npm install --save --dev xhr-mocklet

# Or via yarn:
yarn add --dev xhr-mocklet
```

## Usage

```js
const mock = require('xhr-mocklet');

// Replace the real XHR object with the mock XHR object
mock.setup();

// Mock a response for all POST requests to http://localhost/api/user
mock.post('http://localhost/api/user', (req, res) => {
  return res
    .status(201)
    .header('Content-Type', 'application/json')
    .body({
      lastName: 'John',
      firstName: 'Smith'
    });
});

// Restore the original XHR object when all your tests are done.
mock.teardown();
```

### Simulating an error

Simply return `null` from your respnose handler:

```js
mock.post('http://localhost/foo', (req, res) => null);
```

### Simulate a timeout

```js
mock.post('http://localhost/foo', (req, res) => res.timeout(true));
```

### Use mocked `XMLHttpRequest`

You can even use a mocked `XMLHttpReqeuest` instance to create Requests:

```js
// Create an instance of the (mock) XHR object and use as per normal
const xhr = new XMLHttpRequest();

xhr.onreadystatechange = () => {
  if (xhr.readyState === xhr.DONE) {
    // when you're finished put the real XHR object back
    mock.teardown();
  }
}
```

## API

### Builder

| Method | Description |
|---|---|
| `setup()` | Replace the global `XMLHttpRequest` object with the `MockXMLHttpRequest`. |
| `teardown()` | Restore the global `XMLHttpRequest` object to its original state. |
| `reset()` | Remove all request handlers. |
| `get(url: string | regex, callback)` | Create `GET` mock response for a specific url. |
| `post(url: string | regex, callback)` | Create `POST` mock response for a specific url. |
| `put(url: string | regex, callback)` | Create `PUT` mock response for a specific url. |
| `patch(url: string | regex, callback)` | Create `PATCH` mock response for a specific url. |
| `delete(url: string | regex, callback)` | Create `DELETE` mock response for a specific url. |
| `mock(callback)` | Register mock response for every request. |



### MockXMLHttpRequest

### MockRequest

| Method | Description |
|---|---|
| `method(): string` | Get the request method. |
| `url(): string` | Get the request URL. |
| `url(): string` | Get the request URL. |
| `query(): object` | Get the parsed query part of the request URL. |
| `header(name: string): string` | Get a request header. |
| `headers(): object` | Get all request headers. |
| `body(): string` | Get the request body. |

### MockResponse

| Method | Description |
|---|---|
| `status(): number` | Get the response status. |
| `status(code: number)` | Set the response status. |
| `header(name: string): string` | Get a response header. |
| `header(name: string, value: string)` | Set a response header. |
| `headers(): object` | Get response headers. |
| `headers(headers: obejct)` | Set response headers. |
| `body(): string` | Get response body. |
| `body(body: string)` | Set response body. |
| `timeout(): boolean | number` | Get weather the response will trigger a timeout. |
| `timeout(ms: boolean | number)` | Set a timeout, otherwise default to the value set on the XHR object. |
| `progress(loaded: number, total: number, lengthComputable: boolean)` | Trigger progress event. Pass in loaded size, total size and if event is lengthComputable. |

## Special Thanks

Special thanks goes to [James Newell](https://github.com/jameslnewell/) for his
[xhr-mock](https://github.com/jameslnewell/xhr-mock) library. `xhr-mocklet`
started out as a fork of his work.
