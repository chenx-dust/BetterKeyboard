import {
  PanelSection,
  PanelSectionRow,
  staticClasses,
  ToggleField,
  Unregisterable
} from "@decky/ui";
import {
  addEventListener,
  callable,
  definePlugin,
  toaster,
} from "@decky/api"
import { useState, useEffect } from "react";
import { FaKeyboard } from "react-icons/fa";
import { localizationManager, L } from "./i18n";
import { t } from 'i18next';
import { Fiber, VirtualKeyboardComponent, VirtualKeyboardManager } from "./types";


const MAX_FAILURE_COUNT = 10;
const RETRY_TIMEOUT = 100;

let virtualKeyboardManager: VirtualKeyboardManager | null = null;

const backendGrabKeyboard = callable<[], void>("grab_keyboards");
const backendUngrabKeyboard = callable<[], void>("ungrab_keyboards");

const getActiveWindow = () => window.SteamUIStore.ActiveWindowInstance;
const getVirtualKeyboardDOM = () => getActiveWindow().BrowserWindow.document.getElementById('virtual keyboard');
// const getVirtualKeyboardDOM = () => getActiveWindow().BrowserWindow.document.activeElement;
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
  while (current && current.stateNode != child) {
    if (current.stateNode?.m_keyboardDiv === child)
      return current.stateNode;
    current = current.child;
  }
  return null;
};

const rawKeyboardListener = (code: number, value: number) => {
  console.log("keyboard", code, value);
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
        if (b.dataset.key == " ") {
          b.dataset.key = "";
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
  const tryGetDOM = (failCnt: number) => {
    if (failCnt >= MAX_FAILURE_COUNT) {
      console.error("Failed to get keyboard DOM");
      return;
    }
    const dom = getVirtualKeyboardDOM();
    if (dom == null) {
      setTimeout(() => tryGetDOM(failCnt + 1), RETRY_TIMEOUT);
    } else {
      modifyKeyboard(dom);
      const component = getVirtualKeyboardComponent(dom);
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
