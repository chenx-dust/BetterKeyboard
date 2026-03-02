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
  component: VirtualKeyboardComponent | null = null;
  dom: HTMLElement | null = null;
  compact: boolean = false;
  compactOnlyWithPhysicalKeyboard: boolean = false;
  disabled: boolean = false;
  enableKeyboardShortcut: boolean = false;
  rawListener: ((c: number, v: number) => void) | null = null;
  shortClickLeftShift: boolean = false;
  private shortcutListenerRunning: boolean = false;
  private shortcutKeydownListener: ((e: KeyboardEvent) => void) | null = null;

  private setKeyboardVisibleReplace(manager: VirtualKeyboardManager): () => void {
    return () => {
      if (this.disabled)
        return;
      if (manager?.SetVirtualKeyboardVisible_)
        manager.SetVirtualKeyboardVisible_();

      console.log("[VirtualKeyboard] SetVirtualKeyboardVisible");

      const ctx = this;

      tryGetDOM((dom: HTMLElement) => {
        (async () => {
          ctx.dom = dom;
          ctx.component = getVirtualKeyboardComponent(dom);
          const hasPhysicalKeyboard = await Backend.findKeyboards();
          const shouldCompact = ctx.compact && (!ctx.compactOnlyWithPhysicalKeyboard || hasPhysicalKeyboard);
          if (shouldCompact)
            CompactizeKeyboard(dom);

          if (ctx.rawListener) {
            removeEventListener("keyboard", ctx.rawListener);
            ctx.rawListener = null;
          }

          if (!hasPhysicalKeyboard) {
            await Backend.ungrabKeyboard();
            return;
          }

          await Backend.grabKeyboard();
          ctx.rawListener = CreateRawKeyboardListener(ctx);
          addEventListener("keyboard", ctx.rawListener);
        })().catch((e) => console.error("[VirtualKeyboard] Failed to initialize keyboard capture", e));
      }, 0);
    };
  }

  private setKeyboardHiddenReplace(manager: VirtualKeyboardManager): () => void {
    return () => {
      if (manager?.SetVirtualKeyboardHidden_)
        manager.SetVirtualKeyboardHidden_();

      console.log("[VirtualKeyboard] SetVirtualKeyboardHidden");

      Backend.ungrabKeyboard();
      if (this.rawListener)
        removeEventListener("keyboard", this.rawListener);
    };
  }

  init(): void {
    this.compact = localStorage.getItem("bk.enabled_compact") !== "false";
    this.compactOnlyWithPhysicalKeyboard = localStorage.getItem("bk.compact_only_physical_keyboard") === "true";
    this.disabled = localStorage.getItem("bk.disabled_vk") === "true";
    this.enableKeyboardShortcut = localStorage.getItem("bk.enable_keyboard_shortcut") === "true";
    this.syncKeyboardShortcutListener();
  }

  setKeyboardShortcutEnabled(enabled: boolean): void {
    this.enableKeyboardShortcut = enabled;
    localStorage.setItem("bk.enable_keyboard_shortcut", enabled.toString());
    this.syncKeyboardShortcutListener();
  }

  shutdown(): void {
    if (this.shortcutListenerRunning) {
      if (this.shortcutKeydownListener)
        window.removeEventListener("keydown", this.shortcutKeydownListener, true);
      this.shortcutKeydownListener = null;
      this.shortcutListenerRunning = false;
    }
  }

  private syncKeyboardShortcutListener(): void {
    if (this.enableKeyboardShortcut && !this.shortcutListenerRunning) {
      this.shortcutKeydownListener = (e: KeyboardEvent) => {
        if (!this.enableKeyboardShortcut || this.disabled || e.repeat)
          return;
        if (!e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.code !== "Space")
          return;
        e.preventDefault();
        e.stopPropagation();
        this.showVirtualKeyboard();
      };
      getActiveWindow()?.BrowserWindow.addEventListener("keydown", this.shortcutKeydownListener, true);
      this.shortcutListenerRunning = true;
      return;
    }

    if (!this.enableKeyboardShortcut && this.shortcutListenerRunning) {
      if (this.shortcutKeydownListener)
        getActiveWindow()?.BrowserWindow.removeEventListener("keydown", this.shortcutKeydownListener, true);
      this.shortcutKeydownListener = null;
      this.shortcutListenerRunning = false;
    }
  }

  private showVirtualKeyboard(): void {
    const manager = getActiveWindow()?.VirtualKeyboardManager;
    if (!manager) {
      console.error("[VirtualKeyboard] VirtualKeyboardManager not found!");
      return;
    }
    console.info("[VirtualKeyboard] Showing virtual keyboard");
    manager.SetVirtualKeyboardVisible();
  }

  replaceShowKeyboard(): void {
    let manager = getActiveWindow()?.VirtualKeyboardManager;
    if (!manager) {
      console.error("[VirtualKeyboard] VirtualKeyboardManager not found!");
      return;
    }

    console.log("[VirtualKeyboard] ReplaceShowKeyboard");

    if (!manager.SetVirtualKeyboardVisible_) {
      manager.SetVirtualKeyboardVisible_ = manager.SetVirtualKeyboardVisible;
      manager.SetVirtualKeyboardVisible = this.setKeyboardVisibleReplace(manager);
    }
    if (!manager.SetVirtualKeyboardHidden_) {
      manager.SetVirtualKeyboardHidden_ = manager.SetVirtualKeyboardHidden;
      manager.SetVirtualKeyboardHidden = this.setKeyboardHiddenReplace(manager);
    }
  }

  restoreShowKeyboard(): void {
    let manager = getActiveWindow()?.VirtualKeyboardManager;
    if (!manager) {
      console.error("[VirtualKeyboard] VirtualKeyboardManager not found!");
      return;
    }

    console.log("[VirtualKeyboard] RestoreShowKeyboard");

    if (manager.SetVirtualKeyboardVisible_) {
      manager.SetVirtualKeyboardVisible = manager.SetVirtualKeyboardVisible_;
      manager.SetVirtualKeyboardVisible_ = undefined;
    }
    if (manager.SetVirtualKeyboardHidden_) {
      manager.SetVirtualKeyboardHidden = manager.SetVirtualKeyboardHidden_;
      manager.SetVirtualKeyboardHidden_ = undefined;
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
