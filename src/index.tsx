import {
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

function Content() {
  const [enabledReplace, setEnabledReplace] = useState(localStorage.getItem("bk.enabled_replace") === "true");
  const [enabledCompact, setEnabledCompact] = useState(localStorage.getItem("bk.enabled_compact") === "true");

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

  return (
    <PanelSection title={t(L.SETTINGS)}>
      <PanelSectionRow>
        <ToggleField
          label={t(L.ENABLE_PLUGIN)}
          description={t(L.ENABLE_PLUGIN_DESC)}
          checked={enabledReplace}
          onChange={setEnabledReplace}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label={t(L.COMPACT_MODE)}
          description={t(L.COMPACT_MODE_DESC)}
          checked={enabledCompact}
          onChange={setEnabledCompact}
        />
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin(() => {
  localizationManager.init();

  InitContext(ctx);
  ctx.compact = localStorage.getItem("bk.enabled_compact") === "true"
  if (localStorage.getItem("bk.enabled_replace") === "true")
    ReplaceShowKeyboard(ctx);

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
