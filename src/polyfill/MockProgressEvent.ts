import MockEvent from "./MockEvent";

export default class MockProgressEvent extends MockEvent implements ProgressEvent {
  public readonly lengthComputable: boolean;
  public readonly loaded: number;
  public readonly total: number;

  constructor(typeArg: string, eventInitDict?: ProgressEventInit) {
    super(typeArg, eventInitDict);
    Object.assign(this, eventInitDict);
  }

  initProgressEvent(
    typeArg: string,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    lengthComputableArg: boolean,
    loadedArg: number,
    totalArg: number,
  ): void {
    (this as any).type = typeArg;
    (this as any).bubbles = canBubbleArg;
    (this as any).cancelable = cancelableArg;
    (this as any).lengthComputable = lengthComputableArg;
    (this as any).loaded = loadedArg;
    (this as any).total = totalArg;
  }
}
