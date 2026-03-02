import { callable } from "@decky/api";

export class Backend {
  static findKeyboards() {
    return callable<[], boolean>("find_keyboards")();
  }

  static grabKeyboard() {
    return callable<[], void>("grab_keyboards")();
  }

  static ungrabKeyboard() {
    return callable<[], void>("ungrab_keyboards")();
  }

  static blacklistDetectedKeyboardPhys() {
    return callable<[], void>("blacklist_detected_keyboard_phys")();
  }

  static resetBlacklistDefault() {
    return callable<[], void>("reset_blacklist_default")();
  }
}
