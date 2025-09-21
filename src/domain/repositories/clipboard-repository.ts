export interface ClipboardRepository {
  getClipboardContent(): Promise<string>;
  hasClipboardChanged(lastTimestamp?: number): Promise<boolean>;
}