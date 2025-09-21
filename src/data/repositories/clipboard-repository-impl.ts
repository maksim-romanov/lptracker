import * as Clipboard from "expo-clipboard";

import type { ClipboardRepository } from "domain/repositories/clipboard-repository";

export class ClipboardRepositoryImpl implements ClipboardRepository {
  private lastContent = "";
  private lastTimestamp = 0;

  async getClipboardContent(): Promise<string> {
    try {
      const content = await Clipboard.getStringAsync();
      this.lastContent = content;
      this.lastTimestamp = Date.now();
      return content;
    } catch (error) {
      console.error("Failed to get clipboard content:", error);
      return "";
    }
  }

  async hasClipboardChanged(lastTimestamp?: number): Promise<boolean> {
    try {
      const currentContent = await Clipboard.getStringAsync();

      if (lastTimestamp && this.lastTimestamp <= lastTimestamp) {
        return false;
      }

      const hasChanged = currentContent !== this.lastContent;

      if (hasChanged) {
        this.lastContent = currentContent;
        this.lastTimestamp = Date.now();
      }

      return hasChanged;
    } catch (error) {
      console.error("Failed to check clipboard changes:", error);
      return false;
    }
  }
}
