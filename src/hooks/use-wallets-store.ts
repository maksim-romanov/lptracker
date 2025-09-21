import { useMemo } from "react";

import { walletsStore, WalletsStore } from "../presentation/stores/wallets-store";

export const useWalletsStore = (): WalletsStore => {
  return useMemo(() => walletsStore, []);
};