import * as ee from "event-emitter";

export default class MockXMLHttpRequestUpload implements XMLHttpRequestUpload {
  onabort: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  onerror: (this: XMLHttpRequestEventTarget, ev: ErrorEvent) => any;
  onload: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  onloadend: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any;
  onloadstart: (this: XMLHttpRequestEventTarget, ev: Event) => any;
  onprogress: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any;
  ontimeout: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any;

  private emitter: ee.Emitter;

  constructor() {
    this.emitter = ee({});
  }

  dispatchEvent(evt: Event) {
    this.emitter.emit(evt.type, evt);
    return false;
  }

  addEventListener(type: string, listener: EventListener, useCapture?: boolean) {
    this.emitter.on(type, listener);
  }

  removeEventListener(type: string, listener?: EventListener, options?: boolean) {
    this.emitter.off(type, listener);
  }
}
