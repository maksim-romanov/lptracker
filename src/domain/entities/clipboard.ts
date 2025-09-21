import { Address } from "viem";

export interface ClipboardData {
  content: string;
  isValidAddress: boolean;
  timestamp: number;
}

export interface ClipboardState {
  currentData?: ClipboardData;
  lastChecked?: number;
}

export interface AddWalletSuggestion {
  show: boolean;
  address?: Address;
}