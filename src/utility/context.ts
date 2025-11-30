import {
  addEventListener,
  removeEventListener,
} from "@decky/api"

import { Fiber, VirtualKeyboardComponent, VirtualKeyboardManager } from "../types";
import { Backend } from "./backend";
import { CompactizeKeyboard, CreateRawKeyboardListener } from "./keyboard";

const MAX_FAILURE_COUNT = 10;
const RETRY_TIMEOUT = 100;

export class VirtualKeyboardContext {
  manager: VirtualKeyboardManager | null = null;
  component: VirtualKeyboardComponent | null = null;
  dom: HTMLElement | null = null;
  compact: boolean = false;
  disabled: boolean = false;
  rawListener: ((c: number, v: number) => void) | null = null;
  shortClickLeftShift: boolean = false;

  private setKeyboardVisibleReplace(): () => void {
    return () => {
      if (this.disabled)
        return;
      if (this.manager?.SetVirtualKeyboardVisible_)
        this.manager.SetVirtualKeyboardVisible_();

      console.log("[VirtualKeyboard] SetVirtualKeyboardVisible");

      const ctx = this;

      tryGetDOM((dom: HTMLElement) => {
        ctx.dom = dom;
        if (ctx.compact)
          CompactizeKeyboard(dom);
        ctx.component = getVirtualKeyboardComponent(dom);
        Backend.grabKeyboard();
        if (ctx.rawListener)
          removeEventListener("keyboard", ctx.rawListener);
        ctx.rawListener = CreateRawKeyboardListener(ctx);
        addEventListener("keyboard", ctx.rawListener);
      }, 0);
    };
  }

  private setKeyboardHiddenReplace(): () => void {
    return () => {
      if (this.manager?.SetVirtualKeyboardHidden_)
        this.manager.SetVirtualKeyboardHidden_();

      console.log("[VirtualKeyboard] SetVirtualKeyboardHidden");

      Backend.ungrabKeyboard();
      if (this.rawListener)
        removeEventListener("keyboard", this.rawListener);
    };
  }

  init(): void {
    this.manager = getActiveWindow()?.VirtualKeyboardManager;
    this.compact = localStorage.getItem("bk.enabled_compact") !== "false";
    this.disabled = localStorage.getItem("bk.disabled_vk") === "true";
  }

  replaceShowKeyboard(): void {
    if (!this.manager) {
      console.error("[VirtualKeyboard] VirtualKeyboardManager not found!");
      return;
    }

    console.log("[VirtualKeyboard] ReplaceShowKeyboard");

    if (!this.manager.SetVirtualKeyboardVisible_) {
      this.manager.SetVirtualKeyboardVisible_ = this.manager.SetVirtualKeyboardVisible;
      this.manager.SetVirtualKeyboardVisible = this.setKeyboardVisibleReplace();
    }
    if (!this.manager.SetVirtualKeyboardHidden_) {
      this.manager.SetVirtualKeyboardHidden_ = this.manager.SetVirtualKeyboardHidden;
      this.manager.SetVirtualKeyboardHidden = this.setKeyboardHiddenReplace();
    }
  }

  restoreShowKeyboard(): void {
    if (!this.manager) {
      console.error("[VirtualKeyboard] VirtualKeyboardManager not found!");
      return;
    }

    console.log("[VirtualKeyboard] RestoreShowKeyboard");

    if (this.manager.SetVirtualKeyboardVisible_) {
      this.manager.SetVirtualKeyboardVisible = this.manager.SetVirtualKeyboardVisible_;
      this.manager.SetVirtualKeyboardVisible_ = undefined;
    }
    if (this.manager.SetVirtualKeyboardHidden_) {
      this.manager.SetVirtualKeyboardHidden = this.manager.SetVirtualKeyboardHidden_;
      this.manager.SetVirtualKeyboardHidden_ = undefined;
    }
  }
}

const getActiveWindow = () => window.SteamUIStore.ActiveWindowInstance;
const getVirtualKeyboardDOM = () => getActiveWindow().BrowserWindow.document?.getElementById('virtual keyboard');

const tryGetDOM = (callback: (dom: HTMLElement) => void, failCnt: number) => {
  if (failCnt >= MAX_FAILURE_COUNT) {
    console.error("[VirtualKeyboard] Failed to get keyboard DOM");
    return;
  }
  const dom = getVirtualKeyboardDOM();
  if (dom == null) {
    setTimeout(() => tryGetDOM(callback, failCnt + 1), RETRY_TIMEOUT);
  } else {
    callback(dom);
  }
};

const getVirtualKeyboardComponent = (dom: Element | null) => {
  // search for component
  // the component is between this dom and its child
  if (!dom) return null;
  const child = dom.firstChild;

  // find react fiber
  let current = null;
  for (let key in dom) {
    if (key.startsWith("__reactFiber$")) {
      current = dom[key as keyof Element] as unknown as Fiber;
      break;
    }
  }

  // find component recursively
  while (current && current?.stateNode != child) {
    if (current?.stateNode?.m_keyboardDiv === child)
      return current?.stateNode;
    current = current?.child;
  }
  return null;
};