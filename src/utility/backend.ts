import { callable } from "@decky/api";

export class Backend {
  static grabKeyboard() {
    return callable<[], void>("grab_keyboards")();
  }
  static ungrabKeyboard() {
    return callable<[], void>("ungrab_keyboards")();
  }
}
