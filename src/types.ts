export enum AssistantState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  IDLE = "idle",
  LISTENING = "listening",
  SPEAKING = "speaking",
  ERROR = "error"
}

export interface OpenedWebsite {
  siteName: string;
  url: string;
  timestamp: Date;
}
