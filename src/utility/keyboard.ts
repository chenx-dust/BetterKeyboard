import {
  addEventListener,
  removeEventListener,
  callable,
} from "@decky/api"
import { Fiber, TypeKeyEvent, VirtualKeyboardComponent, VirtualKeyboardManager } from "../types";
import { EvdevToKey, GetPosFromKey, KeyToEvdev } from "./map";
import { GamepadEvent } from "@decky/ui";
import { L } from "../i18n";
import { t } from 'i18next';

const MAX_FAILURE_COUNT = 10;
const RETRY_TIMEOUT = 100;
const SHORT_CLICK_TIMEOUT = 250;
const SPACE_TIP_TIMEOUT = 2000;

export class VirtualKeyboardContext {
  manager: VirtualKeyboardManager | null = null;
  component: VirtualKeyboardComponent | null = null;
  dom: HTMLElement | null = null;
  compact: boolean = false;
  disabled: boolean = false;
  rawListener: ((c: number, v: number) => void) | null = null;
}

const backendGrabKeyboard = callable<[], void>("grab_keyboards");
const backendUngrabKeyboard = callable<[], void>("ungrab_keyboards");

const getActiveWindow = () => window.SteamUIStore.ActiveWindowInstance;
const getVirtualKeyboardDOM = () => getActiveWindow().BrowserWindow.document?.getElementById('virtual keyboard');

// const getVirtualKeyboardDOM = () => getActiveWindow().BrowserWindow.documenkey?.activeElement;
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

let shortClickLeftShift = false;
const rawKeyboardListener = (ctx: VirtualKeyboardContext) => (code: number, value: number) => {
  console.log("keyboard", EvdevToKey[code as keyof typeof EvdevToKey], value);
  // Special Keys
  const checkAltGr = () => {
    if (ctx.dom?.querySelector('div[data-key="AltGr"]') === null)
      return;
    ctx.component?.setState(((e: VirtualKeyboardComponent, _) => ({
      ...e,
      toggleStates: {
        ...e.toggleStates,
        AltGr: Math.min(e.toggleStates?.Alt || 0,
          e.toggleStates?.Control || 0),
      }
    })));
  };
  if (code == KeyToEvdev.ShiftLeft || code == KeyToEvdev.ShiftRight) {
    ctx.component?.setState(((e: VirtualKeyboardComponent, _) => ({
      ...e,
      toggleStates: {
        ...e.toggleStates,
        Shift: value === 0 ? 0 : 2,
      }
    })));
    if (code == KeyToEvdev.ShiftLeft) {
      // short click detect
      if (value === 1) {
        shortClickLeftShift = true;
        setTimeout(() => shortClickLeftShift = false, SHORT_CLICK_TIMEOUT);
        return;
      }
    } else {
      return;
    }
  } else if (code == KeyToEvdev.ControlLeft || code == KeyToEvdev.ControlRight) {
    ctx.component?.setState(((e: VirtualKeyboardComponent, _) => ({
      ...e,
      toggleStates: {
        ...e.toggleStates,
        Control: value === 0 ? 0 : 2,
      }
    })));
    checkAltGr();
    return;
  } else if (code == KeyToEvdev.AltLeft || code == KeyToEvdev.AltRight) {
    ctx.component?.setState(((e: VirtualKeyboardComponent, _) => ({
      ...e,
      toggleStates: {
        ...e.toggleStates,
        Alt: value === 0 ? 0 : 2,
      }
    })));
    checkAltGr();
    return;
  } else if (code == KeyToEvdev.CapsLock && value === 1) {
    ctx.component?.setState(((e: VirtualKeyboardComponent, _) => ({
      ...e,
      toggleStates: {
        ...e.toggleStates,
        CapsLock: e.toggleStates.CapsLock === 0 ? 2 : 0,
      }
    })));
    return;
  }
  // Normal Keys
  let ev: TypeKeyEvent = {
    strKey: "",
    strKeycode: "",
  };
  const hasIntlBackslash = ctx.dom?.querySelector(`div[data-key-row="3"][data-key-col="12"]`) !== null;
  const pos = GetPosFromKey(code, hasIntlBackslash);
  if (value == 0) {
    if (code == KeyToEvdev.ShiftLeft && shortClickLeftShift)
      ev.strKey = "SwitchKeys_Layout";
    else
      return;
  } else if (code == KeyToEvdev.Space) {
    ev.strKey = " ";
  } else if (code == KeyToEvdev.Delete) {
    ev.strKey = "\x7F";
  } else if (code == KeyToEvdev.Escape) {
    ev.strKey = "VKClose";
  } else if (code == KeyToEvdev.Space &&
    ctx.dom?.querySelector('div[data-key="IME_LUT_Select_0"]')) {
    ev.strKey = "IME_LUT_Select_0";
  } else if (code >= KeyToEvdev.Digit1 && code <= KeyToEvdev.Digit0 &&
    ctx.dom?.querySelector('div[data-key="IME_LUT_Select_0"]')) {
    ev.strKey = "IME_LUT_Select_" + (code - KeyToEvdev.Digit1);
  } else if (pos !== null) {
    const key = ctx.dom?.querySelector(`div[data-key-row="${pos[0]}"][data-key-col="${pos[1]}"]`);
    ev = {
      strKey: key?.getAttribute("data-key") || undefined,
      strKeycode: key?.getAttribute("data-keycode") || undefined,
      strIsLiteral: key?.getAttribute("data-key-is-literal") || undefined,
      strKeyHandler: key?.getAttribute("data-key-handler") || undefined,
      strEmojiIndex: key?.getAttribute("data-emoji-index") || undefined,
      strEmojiTint: key?.getAttribute("data-emoji-tint") || undefined,
      strShifted: key?.getAttribute("data-key-shifted") || undefined,
      strDeadKeyNext: key?.getAttribute("data-dead-key-next") || undefined,
      strDeadKeyCombined: key?.getAttribute("data-dead-key-combined") || undefined,
    };
  } else {
    ev.strKey = EvdevToKey[code as keyof typeof EvdevToKey];
    if (!ev.strKey.startsWith("Arrow"))
      return;
  }
  ctx.component?.TypeKeyInternal(ev);
};

const modifyKeyboard = (dom: HTMLElement) => {
  if (dom.style.animation == "none")
    return; // already modified
  dom.style.animation = "none";
  let displayNone = [];
  Array.from(dom.firstElementChild?.children || []).forEach((row) => {
    if (["1", "2", "3", "4"].includes(row.ariaRowIndex || "")) {
      (row as HTMLElement).style.display = "none";
      displayNone.push(row);
    }
    if (row.ariaRowIndex == "5") {
      const space = row.querySelector('div[data-key=" "]') as HTMLElement;
      const span = space.querySelector("span");
      if (span)
        setTimeout(() => span.innerText = t(L.SHOW_FULL_KEYBOARD), SPACE_TIP_TIMEOUT);
      let clickCallback = (e: GamepadEvent | MouseEvent | TouchEvent) => {
        if (e.type === "vgp_onbuttonup" && (e as GamepadEvent).detail.button !== 1)
          return;
        displayNone.forEach((e) => (e as HTMLElement).style = "");
        if (span)
          span.innerText = " ";
        space.removeEventListener("click", clickCallback);
        space.removeEventListener("touchend", clickCallback);
        // @ts-ignore
        space.removeEventListener("vgp_onbuttonup", clickCallback);
        setTimeout(() => space.dataset.key = " ", 0); // wait for a little bit to prevent input
      };
      space.addEventListener("click", clickCallback);
      space.addEventListener("touchend", clickCallback);
      // @ts-ignore
      space.addEventListener("vgp_onbuttonup", clickCallback);
    }
  });
}

const setKeyboardVisibleReplace = (ctx: VirtualKeyboardContext) => () => {
  if (ctx.disabled)
    return;
  if (ctx.manager?.SetVirtualKeyboardVisible_)
    ctx.manager.SetVirtualKeyboardVisible_();

  console.log("[VirtualKeyboard] SetVirtualKeyboardVisible");

  const tryGetDOM = (failCnt: number) => {
    if (failCnt >= MAX_FAILURE_COUNT) {
      console.error("[VirtualKeyboard] Failed to get keyboard DOM");
      return;
    }
    const dom = getVirtualKeyboardDOM();
    if (dom == null) {
      setTimeout(() => tryGetDOM(failCnt + 1), RETRY_TIMEOUT);
    } else {
      ctx.dom = dom;
      if (ctx.compact)
        modifyKeyboard(dom);
      ctx.component = getVirtualKeyboardComponent(dom);
      backendGrabKeyboard();
      if (ctx.rawListener)
        removeEventListener("keyboard", ctx.rawListener);
      ctx.rawListener = rawKeyboardListener(ctx);
      addEventListener("keyboard", ctx.rawListener);
    }
  };
  tryGetDOM(0);
};

const setKeyboardHiddenReplace = (ctx: VirtualKeyboardContext) => () => {
  if (ctx.manager?.SetVirtualKeyboardHidden_)
    ctx.manager.SetVirtualKeyboardHidden_();

  console.log("[VirtualKeyboard] SetVirtualKeyboardHidden");

  backendUngrabKeyboard();
  if (ctx.rawListener)
    removeEventListener("keyboard", ctx.rawListener);
}

export const ReplaceShowKeyboard = (ctx: VirtualKeyboardContext) => {
  ctx.manager = getActiveWindow()?.VirtualKeyboardManager;
  ctx.compact = localStorage.getItem("bk.enabled_compact") !== "false";
  ctx.disabled = localStorage.getItem("bk.disabled_vk") === "true";
  if (localStorage.getItem("bk.enabled_replace") === "true")
    replaceShowKeyboardImpl(ctx);
};

const replaceShowKeyboardImpl = (ctx: VirtualKeyboardContext) => {
  if (!ctx.manager) {
    console.error("[VirtualKeyboard] VirtualKeyboardManager not found!");
    return;
  }

  console.log("[VirtualKeyboard] ReplaceShowKeyboard");

  if (!ctx.manager.SetVirtualKeyboardVisible_) {
    ctx.manager.SetVirtualKeyboardVisible_ = ctx.manager.SetVirtualKeyboardVisible;
    ctx.manager.SetVirtualKeyboardVisible = setKeyboardVisibleReplace(ctx);
  }
  if (!ctx.manager.SetVirtualKeyboardHidden_) {
    ctx.manager.SetVirtualKeyboardHidden_ = ctx.manager.SetVirtualKeyboardHidden;
    ctx.manager.SetVirtualKeyboardHidden = setKeyboardHiddenReplace(ctx);
  }
};
export const RestoreShowKeyboard = (ctx: VirtualKeyboardContext) => {
  if (!ctx.manager) {
    console.error("[VirtualKeyboard] VirtualKeyboardManager not found!");
    return;
  }

  console.log("[VirtualKeyboard] RestoreShowKeyboard");

  if (ctx.manager.SetVirtualKeyboardVisible_) {
    ctx.manager.SetVirtualKeyboardVisible = ctx.manager.SetVirtualKeyboardVisible_;
    ctx.manager.SetVirtualKeyboardVisible_ = undefined;
  }
  if (ctx.manager.SetVirtualKeyboardHidden_) {
    ctx.manager.SetVirtualKeyboardHidden = ctx.manager.SetVirtualKeyboardHidden_;
    ctx.manager.SetVirtualKeyboardHidden_ = undefined;
  }
};
