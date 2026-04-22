import { ref } from "vue";
import { homeDir, join } from "@tauri-apps/api/path";
import { readDirectory, readFileContent } from "../services/fileIoService";
import { invoke } from "@tauri-apps/api/core";
import type { SessionEntry, ActiveSession } from "../types/session";

const sessions = ref<SessionEntry[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadSessions() {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    const home = await homeDir();
    const historyPath = await join(home, ".claude", "history.jsonl");

    let content: string;
    try {
      content = await readFileContent(historyPath);
    } catch {
      sessions.value = [];
      return;
    }

    // Group history lines by sessionId
    const groups = new Map<
      string,
      { firstPrompt: string; projectPath: string; lastTimestamp: number; count: number }
    >();

    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (!entry.sessionId || !entry.display) continue;

        const existing = groups.get(entry.sessionId);
        if (existing) {
          existing.count++;
          if (entry.timestamp > existing.lastTimestamp) {
            existing.lastTimestamp = entry.timestamp;
          }
        } else {
          groups.set(entry.sessionId, {
            firstPrompt: entry.display,
            projectPath: entry.project || "",
            lastTimestamp: entry.timestamp || 0,
            count: 1,
          });
        }
      } catch {
        // skip malformed lines
      }
    }

    // Read active sessions
    const activeSessionIds = new Set<string>();
    try {
      const sessionsDir = await join(home, ".claude", "sessions");
      const pidEntries = await readDirectory(sessionsDir);
      for (const entry of pidEntries) {
        if (!entry.isFile || !entry.name.endsWith(".json")) continue;
        try {
          const pidPath = await join(sessionsDir, entry.name);
          const pidContent = await readFileContent(pidPath);
          const active: ActiveSession = JSON.parse(pidContent);
          if (active.sessionId) {
            activeSessionIds.add(active.sessionId);
          }
        } catch {
          // skip unreadable pid files
        }
      }
    } catch {
      // sessions dir may not exist
    }

    // Build session list
    const result: SessionEntry[] = [];
    for (const [sessionId, data] of groups) {
      result.push({
        sessionId,
        firstPrompt: data.firstPrompt,
        projectPath: data.projectPath,
        lastTimestamp: data.lastTimestamp,
        messageCount: data.count,
        isActive: activeSessionIds.has(sessionId),
      });
    }

    // Sort by time descending (most recent first)
    result.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    sessions.value = result;
  } catch (e) {
    console.error("Failed to load sessions:", e);
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

async function resumeSession(sessionId: string, projectPath: string) {
  try {
    await invoke("resume_claude_session", { sessionId, cwd: projectPath });
  } catch (e) {
    console.error("Failed to resume session:", e);
    error.value = e instanceof Error ? e.message : String(e);
  }
}

export function useSessions() {
  return { sessions, loading, error, loadSessions, resumeSession };
}
