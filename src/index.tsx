import {
  ButtonItem,
  EUIMode,
  PanelSection,
  PanelSectionRow,
  staticClasses,
  ToggleField,
} from "@decky/ui";
import {
  definePlugin,
} from "@decky/api"
import { useState, useEffect } from "react";
import { FaKeyboard } from "react-icons/fa";
import { localizationManager, L } from "./i18n";
import { t } from 'i18next';
import { VirtualKeyboardContext } from "./utility/context";
import { Backend } from "./utility/backend";

let ctx = new VirtualKeyboardContext();

const replaceInGamepadMode = (mode: EUIMode) => {
  if (mode !== EUIMode.GamePad)
    return;
  console.log("[VirtualKeyboard] GamePad mode detected, ready for replacing")
  if (localStorage.getItem("bk.enabled_replace") === "true") {
    console.log("[VirtualKeyboard] Replacing show keyboard during initialization");
    const replaceProcess = () => ctx.replaceShowKeyboard();
    replaceProcess();
    // make sure to replace after reload
    setTimeout(replaceProcess, 1);
    setTimeout(replaceProcess, 5);
  }
}


function Content() {
  const [enabledReplace, setEnabledReplace] = useState(localStorage.getItem("bk.enabled_replace") === "true");
  const [enabledCompact, setEnabledCompact] = useState(localStorage.getItem("bk.enabled_compact") !== "false");
  const [compactOnlyPhysicalKeyboard, setCompactOnlyPhysicalKeyboard] = useState(
    localStorage.getItem("bk.compact_only_physical_keyboard") === "true"
  );
  const [disabledVK, setDisabledVK] = useState(localStorage.getItem("bk.disabled_vk") === "true");
  const [enableKeyboardShortcut, setEnableKeyboardShortcut] = useState(
    localStorage.getItem("bk.enable_keyboard_shortcut") === "true"
  );
  const [blacklistBusy, setBlacklistBusy] = useState(false);
  const [resetBlacklistBusy, setResetBlacklistBusy] = useState(false);

  useEffect(() => {
    localStorage.setItem("bk.enabled_replace", enabledReplace.toString());
    if (enabledReplace) {
      ctx.replaceShowKeyboard();
    } else {
      ctx.restoreShowKeyboard();
    }
  }, [enabledReplace]);

  useEffect(() => {
    localStorage.setItem("bk.enabled_compact", enabledCompact.toString());
    ctx.compact = enabledCompact;
  }, [enabledCompact]);

  useEffect(() => {
    localStorage.setItem("bk.compact_only_physical_keyboard", compactOnlyPhysicalKeyboard.toString());
    ctx.compactOnlyWithPhysicalKeyboard = compactOnlyPhysicalKeyboard;
  }, [compactOnlyPhysicalKeyboard]);

  useEffect(() => {
    localStorage.setItem("bk.disabled_vk", disabledVK.toString());
    ctx.disabled = disabledVK;
  }, [disabledVK]);

  useEffect(() => {
    ctx.setKeyboardShortcutEnabled(enableKeyboardShortcut);
  }, [enableKeyboardShortcut]);

  const onBlacklistDetectedPhys = async () => {
    if (blacklistBusy || resetBlacklistBusy)
      return;
    try {
      setBlacklistBusy(true);
      await Backend.blacklistDetectedKeyboardPhys();
      console.info("[VirtualKeyboard] Added detected keyboard phys to blacklist");
    } catch (e) {
      console.error("[VirtualKeyboard] Failed to add detected phys to blacklist", e);
    } finally {
      setBlacklistBusy(false);
    }
  };

  const onResetBlacklistDefault = async () => {
    if (blacklistBusy || resetBlacklistBusy)
      return;
    try {
      setResetBlacklistBusy(true);
      await Backend.resetBlacklistDefault();
      console.info("[VirtualKeyboard] Reset blacklist to default");
    } catch (e) {
      console.error("[VirtualKeyboard] Failed to reset blacklist", e);
    } finally {
      setResetBlacklistBusy(false);
    }
  };

  return <>
    <PanelSection>
      <PanelSectionRow>
        <ToggleField
          label={t(L.ENABLE_PLUGIN)}
          description={t(L.ENABLE_PLUGIN_DESC)}
          checked={enabledReplace}
          onChange={setEnabledReplace}
        />
      </PanelSectionRow>
    </PanelSection>
    {enabledReplace && <>
      <PanelSection title={t(L.COMPACT_MODE)}>
        <PanelSectionRow>
          <ToggleField
            label={t(L.ENABLE_COMPACT_MODE)}
            description={t(L.ENABLE_COMPACT_MODE_DESC)}
            checked={enabledCompact}
            onChange={setEnabledCompact}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t(L.COMPACT_ONLY_PHYSICAL_KEYBOARD)}
            description={t(L.COMPACT_ONLY_PHYSICAL_KEYBOARD_DESC)}
            checked={compactOnlyPhysicalKeyboard}
            onChange={setCompactOnlyPhysicalKeyboard}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t(L.SETTINGS)}>
        <PanelSectionRow>
          <ToggleField
            label={t(L.DISABLE_VK)}
            description={t(L.DISABLE_VK_DESC)}
            checked={disabledVK}
            onChange={setDisabledVK}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t(L.KEYBOARD_SHORTCUT)}
            description={t(L.KEYBOARD_SHORTCUT_DESC)}
            checked={enableKeyboardShortcut}
            onChange={setEnableKeyboardShortcut}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t(L.ACTIONS)}>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            bottomSeparator="none"
            description={t(L.BLACKLIST_DETECTED_PHYS_DESC)}
            disabled={blacklistBusy || resetBlacklistBusy}
            onClick={onBlacklistDetectedPhys}
          >
            {t(L.BLACKLIST_DETECTED_PHYS)}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            bottomSeparator="none"
            description={t(L.RESET_BLACKLIST_DEFAULT_DESC)}
            disabled={blacklistBusy || resetBlacklistBusy}
            onClick={onResetBlacklistDefault}
          >
            {t(L.RESET_BLACKLIST_DEFAULT)}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>}
  </>;
};

export default definePlugin(() => {
  localizationManager.init();
  ctx.init();

  window.SteamClient.UI.GetUIMode().then(replaceInGamepadMode);
  const uiModeChanged = window.SteamClient.UI.RegisterForUIModeChanged(replaceInGamepadMode);

  return {
    // The name shown in various decky menus
    name: "Better Keyboard",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>Better Keyboard</div>,
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <FaKeyboard />,
    onDismount() {
      ctx.shutdown();
      ctx.restoreShowKeyboard();
      uiModeChanged.unregister();
    },
  };
});
