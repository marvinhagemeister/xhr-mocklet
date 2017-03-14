export default class MockEvent implements Event {
  readonly bubbles: boolean;
  cancelBubble: boolean;
  readonly cancelable: boolean;
  readonly currentTarget: EventTarget;
  readonly defaultPrevented: boolean;
  readonly eventPhase: number;
  readonly isTrusted: boolean;
  returnValue: boolean;
  readonly srcElement: Element | null;
  readonly target: EventTarget;
  readonly timeStamp: number;
  readonly type: string;
  readonly scoped: boolean;

  readonly AT_TARGET: number;
  readonly BUBBLING_PHASE: number;
  readonly CAPTURING_PHASE: number;

  constructor(typeArg: string, eventInitDict?: EventInit) {
    this.type = typeArg;
    Object.assign(this, eventInitDict);
  }

  initEvent(
    eventTypeArg: string,
    canBubbleArg: boolean,
    cancelableArg: boolean,
  ): void {
    (this as any).type = eventTypeArg;
    (this as any).bubbles = canBubbleArg;
    (this as any).cancelable = cancelableArg;
  }

  preventDefault(): void {
    (this as any).defaultPrevented = true;
  }

  stopImmediatePropagation(): void {
    // TODO: not implemented
  }

  stopPropagation(): void {
    // TODO: not implemented
  }

  deepPath(): EventTarget[] {
    // TODO: not implemented
    return [];
  }
}
