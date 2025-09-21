import Constants from "expo-constants";

type SupportedChain = "ethereum" | "arbitrum";

type AppExtra = {
  supportedChains?: SupportedChain[];
};

const extra: AppExtra = (Constants?.expoConfig?.extra ?? {}) as AppExtra;

export const SUPPORTED_CHAINS: SupportedChain[] = extra.supportedChains ?? ["ethereum", "arbitrum"];
