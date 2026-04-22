export interface SessionEntry {
  sessionId: string;
  firstPrompt: string;
  projectPath: string;
  lastTimestamp: number;
  messageCount: number;
  isActive: boolean;
}

export interface ActiveSession {
  pid: number;
  sessionId: string;
  cwd: string;
  startedAt: number;
}
