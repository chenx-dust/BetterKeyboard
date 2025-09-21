import {
  PanelSection,
  PanelSectionRow,
  staticClasses,
  ToggleField,
  Unregisterable
} from "@decky/ui";
import {
  addEventListener,
  removeEventListener,
  callable,
  definePlugin,
  toaster,
} from "@decky/api"
import { useState, useEffect } from "react";
import { FaKeyboard } from "react-icons/fa";
import { localizationManager, L } from "./i18n";
import { t } from 'i18next';
import { Fiber, TypeKeyEvent, VirtualKeyboardComponent, VirtualKeyboardManager } from "./types";
import { EvdevToKey, GetPosFromKey, KeyToEvdev } from "./utility/map";


const MAX_FAILURE_COUNT = 10;
const RETRY_TIMEOUT = 100;
const SHORT_CLICK_TIMEOUT = 250;

let virtualKeyboardManager: VirtualKeyboardManager | null = null;
let virtualKeyboardDOM: HTMLElement | null = null;
let virtualKeyboardComponent: VirtualKeyboardComponent | null = null;

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
const rawKeyboardListener = (code: number, value: number) => {
  console.log("keyboard", code, value);
    // Special Keys
  if (code == KeyToEvdev.ShiftLeft || code == KeyToEvdev.ShiftRight) {
    virtualKeyboardComponent?.setState(((e: VirtualKeyboardComponent, _) => ({
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
    virtualKeyboardComponent?.setState(((e: VirtualKeyboardComponent, _) => ({
      ...e,
      toggleStates: {
        ...e.toggleStates,
        Control: value === 0 ? 0 : 2,
      }
    })));
    return;
  } else if (code == KeyToEvdev.AltLeft || code == KeyToEvdev.AltRight) {
    virtualKeyboardComponent?.setState(((e: VirtualKeyboardComponent, _) => ({
      ...e,
      toggleStates: {
        ...e.toggleStates,
        Alt: value === 0 ? 0 : 2,
      }
    })));
    return;
  } else if (code == KeyToEvdev.CapsLock && value === 1) {
    virtualKeyboardComponent?.setState(((e: VirtualKeyboardComponent, _) => ({
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
  const pos = GetPosFromKey(code);
  if (value == 0) {
    if (code == KeyToEvdev.ShiftLeft && shortClickLeftShift)
      ev.strKey = "SwitchKeys_Layout";
    else
      return;
  } else if (code == KeyToEvdev.Delete) {
    ev.strKey = "\x7F";
  } else if (code == KeyToEvdev.Escape) {
    ev.strKey = "VKClose";
  } else if (code == KeyToEvdev.Space &&
    virtualKeyboardDOM?.querySelector('div[data-key="IME_LUT_Select_0"')) {
    ev.strKey = "IME_LUT_Select_0";
  } else if (code >= KeyToEvdev.Digit1 && code <= KeyToEvdev.Digit0 &&
    virtualKeyboardDOM?.querySelector('div[data-key="IME_LUT_Select_0"')) {
    ev.strKey = "IME_LUT_Select_" + (code - KeyToEvdev.Digit1);
  } else if (pos !== null) {
    const key = virtualKeyboardDOM?.querySelector(`div[data-key-row="${pos[0]}"][data-key-col="${pos[1]}"]`);
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
  virtualKeyboardComponent?.TypeKeyInternal(ev);
};

const modifyKeyboard = (dom: HTMLElement) => {
  if (dom.style.animation == "none")
    return; // already modified
  dom.style.animation = "none";
  Array.from(dom.firstElementChild?.children || []).forEach((row) => {
    if (["1", "2", "3", "4"].includes(row.ariaRowIndex || "")) {
      (row as HTMLElement).style.display = "none";
    }
    if (row.ariaRowIndex == "5") {
      Array.from(row.children).forEach((col) => {
        const b = col.firstElementChild as HTMLElement;
        if (b.dataset?.key === " ") {
          Array.from(b.firstElementChild?.children || []).forEach((c) => {
            if (c.firstElementChild?.tagName == "IMG")
              (c as HTMLElement).style.display = "none";
          });
        }
      });
    }
  });
}

const setKeyboardVisibleReplace = () => {
  if (virtualKeyboardManager?.SetVirtualKeyboardVisible_)
    virtualKeyboardManager.SetVirtualKeyboardVisible_();

  console.log("[VirtualKeyboard] SetVirtualKeyboardVisible");

  const tryGetDOM = (failCnt: number) => {
    if (failCnt >= MAX_FAILURE_COUNT) {
      console.error("Failed to get keyboard DOM");
      return;
    }
    const dom = getVirtualKeyboardDOM();
    if (dom == null) {
      setTimeout(() => tryGetDOM(failCnt + 1), RETRY_TIMEOUT);
    } else {
      virtualKeyboardDOM = dom;
      modifyKeyboard(dom);
      virtualKeyboardComponent = getVirtualKeyboardComponent(dom);
      // keyboardHandler(component);
      backendGrabKeyboard();
      addEventListener("keyboard", rawKeyboardListener);
    }
  };
  tryGetDOM(0);
};

const setKeyboardHiddenReplace = () => {
  if (virtualKeyboardManager?.SetVirtualKeyboardHidden_)
    virtualKeyboardManager.SetVirtualKeyboardHidden_();

  console.log("[VirtualKeyboard] SetVirtualKeyboardHidden");

  backendUngrabKeyboard();
  removeEventListener("keyboard", rawKeyboardListener);
}

const replaceShowKeyboard = () => {
  if (!virtualKeyboardManager) return;
  if (!virtualKeyboardManager.SetVirtualKeyboardVisible_) {
    virtualKeyboardManager.SetVirtualKeyboardVisible_ = virtualKeyboardManager.SetVirtualKeyboardVisible;
    virtualKeyboardManager.SetVirtualKeyboardVisible = setKeyboardVisibleReplace;
  }
  if (!virtualKeyboardManager.SetVirtualKeyboardHidden_) {
    virtualKeyboardManager.SetVirtualKeyboardHidden_ = virtualKeyboardManager.SetVirtualKeyboardHidden;
    virtualKeyboardManager.SetVirtualKeyboardHidden = setKeyboardHiddenReplace;
  }
};
const restoreShowKeyboard = () => {
  if (!virtualKeyboardManager) return;
  if (virtualKeyboardManager.SetVirtualKeyboardVisible_) {
    virtualKeyboardManager.SetVirtualKeyboardVisible = virtualKeyboardManager.SetVirtualKeyboardVisible_;
    virtualKeyboardManager.SetVirtualKeyboardVisible_ = undefined;
  }
  if (virtualKeyboardManager.SetVirtualKeyboardHidden_) {
    virtualKeyboardManager.SetVirtualKeyboardHidden = virtualKeyboardManager.SetVirtualKeyboardHidden_;
    virtualKeyboardManager.SetVirtualKeyboardHidden_ = undefined;
  }
};


function Content() {
  return (
    <>
      <PanelSection title="">
        <PanelSectionRow></PanelSectionRow>
      </PanelSection>
    </>
  );
};

export default definePlugin(() => {
  localizationManager.init();
  // VirtualKeyboardManager = window.SteamUIStore.m_WindowStore.SteamUIWindows[0].VirtualKeyboardManager;
  // m_VirtualKeyboardManager = window.SteamUIStore.WindowStore.MainWindowInstance.VirtualKeyboardManager;
  virtualKeyboardManager = getActiveWindow().VirtualKeyboardManager;
  replaceShowKeyboard();


  return {
    // The name shown in various decky menus
    name: "Better Keyboard",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>Better Keyboard</div>,
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <FaKeyboard />,
  };
});
