import { MMKV } from "react-native-mmkv";

export const appStorage = new MMKV({ id: "uniapp-settings" });

export const STORAGE_KEYS = {
  settings: "settings",
  addresses: "addressesV2", // legacy
  wallets: "wallets",
  blockchain: "blockchain",
} as const;
