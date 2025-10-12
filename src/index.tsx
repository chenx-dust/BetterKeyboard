import {
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
import { InitContext, ReplaceShowKeyboard, RestoreShowKeyboard, VirtualKeyboardContext } from "./utility/keyboard";

let ctx = new VirtualKeyboardContext();

const replaceInGamepadMode = (mode: EUIMode) => {
  if (mode !== EUIMode.GamePad)
    return;
  console.log("[VirtualKeyboard] GamePad mode detected, ready for replacing.")
  replaceProcess();
  // make sure to replace after reload
  setTimeout(replaceProcess, 1);
  setTimeout(replaceProcess, 5);
}

const replaceProcess = () => {
  if (localStorage.getItem("bk.enabled_replace") === "true")
    ReplaceShowKeyboard(ctx);
}


function Content() {
  const [enabledReplace, setEnabledReplace] = useState(localStorage.getItem("bk.enabled_replace") === "true");
  const [enabledCompact, setEnabledCompact] = useState(localStorage.getItem("bk.enabled_compact") !== "false");
  const [disabledVK, setDisabledVK] = useState(localStorage.getItem("bk.disabled_vk") === "true");

  useEffect(() => {
    if (enabledReplace) {
      ReplaceShowKeyboard(ctx);
    } else {
      RestoreShowKeyboard(ctx);
    }
    localStorage.setItem("bk.enabled_replace", enabledReplace.toString());
  }, [enabledReplace]);

  useEffect(() => {
    ctx.compact = enabledCompact;
    localStorage.setItem("bk.enabled_compact", enabledCompact.toString());
  }, [enabledCompact]);

  useEffect(() => {
    ctx.disabled = disabledVK;
    localStorage.setItem("bk.disabled_vk", disabledVK.toString());
  }, [disabledVK]);

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
    {enabledReplace && (
      <PanelSection title={t(L.SETTINGS)}>
        <PanelSectionRow>
          <ToggleField
            label={t(L.COMPACT_MODE)}
            description={t(L.COMPACT_MODE_DESC)}
            checked={enabledCompact}
            onChange={setEnabledCompact}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t(L.DISABLE_VK)}
            description={t(L.DISABLE_VK_DESC)}
            checked={disabledVK}
            onChange={setDisabledVK}
          />
        </PanelSectionRow>
      </PanelSection>
    )}
  </>;
};

export default definePlugin(() => {
  localizationManager.init();

  InitContext(ctx);
  ctx.compact = localStorage.getItem("bk.enabled_compact") !== "false"
  ctx.disabled = localStorage.getItem("bk.disabled_vk") === "true"
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
      RestoreShowKeyboard(ctx);
      uiModeChanged.unregister();
    },
  };
});
