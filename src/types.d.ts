declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

export interface VirtualKeyboardManager {
  ShowVirtualKeyboard: (e: any, t: any, r: any) => any;
  SetVirtualKeyboardVisible: () => void;
  SetVirtualKeyboardVisible_: (() => void) | undefined;
  SetVirtualKeyboardHidden: () => void;
  SetVirtualKeyboardHidden_: (() => void) | undefined;
  SetVirtualKeyboardShownInternal: (e: boolean) => void;
}

export interface VirtualKeyboardComponent {
  TypeKeyInternal: (e: TypeKeyEvent) => void;
}

export interface WindowInstance {
  BrowserWindow: Window;
  VirtualKeyboardManager: VirtualKeyboardManager;
}

export interface Fiber {
  child: Fiber | null;
  return: Fiber | null;
  stateNode: any;
}

export interface TypeKeyEvent {
  strKey?: string;
  strKeycode?: string;
  strIsLiteral?: string;
  strKeyHandler?: string;
  strEmojiIndex?: string;
  strEmojiTint?: string;
  strShifted?: string;
  strDeadKeyNext?: string;
  strDeadKeyCombined?: string;
}
