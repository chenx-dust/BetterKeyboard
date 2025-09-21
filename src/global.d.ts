import { WindowInstance } from './types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  interface Window {
    SteamUIStore: {
      WindowStore: {
        MainWindowInstance: WindowInstance;
        SteamUIWindows: WindowInstance[];
      },
      ActiveWindowInstance: WindowInstance;
    };
  }
}
