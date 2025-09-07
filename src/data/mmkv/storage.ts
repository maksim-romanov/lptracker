import { MMKV } from "react-native-mmkv";

export const appStorage = new MMKV({ id: "uniapp-settings" });

export const STORAGE_KEYS = {
  settings: "settings",
  addresses: "addresses",
} as const;


