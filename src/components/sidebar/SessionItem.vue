<script setup lang="ts">
import type { SessionEntry } from "../../types/session";

defineProps<{
  session: SessionEntry;
}>();

const emit = defineEmits<{
  select: [sessionId: string, projectPath: string, firstPrompt: string];
}>();

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return "";
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function projectName(path: string): string {
  if (!path) return "";
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || path;
}
</script>

<template>
  <div
    class="session-item"
    @click="emit('select', session.sessionId, session.projectPath, session.firstPrompt)"
    :title="session.firstPrompt"
  >
    <div class="session-main">
      <span class="active-dot" v-if="session.isActive" title="Active session"></span>
      <svg v-else class="session-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.354L6.694 9H3.5a.5.5 0 0 1-.48-.641l2.5-8z"/>
      </svg>
      <span class="prompt-text">{{ session.firstPrompt }}</span>
    </div>
    <div class="session-meta">
      <span class="meta-project">{{ projectName(session.projectPath) }}</span>
      <span class="meta-sep">·</span>
      <span class="meta-time">{{ formatRelativeTime(session.lastTimestamp) }}</span>
      <span class="meta-sep">·</span>
      <span class="meta-count">{{ session.messageCount }} msgs</span>
    </div>
  </div>
</template>

<style scoped>
.session-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 12px 6px 16px;
  cursor: pointer;
  transition: background 0.1s;
}

.session-item:hover {
  background: #e8e8e8;
}

.session-main {
  display: flex;
  align-items: center;
  gap: 6px;
}

.active-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  box-shadow: 0 0 4px rgba(34, 197, 94, 0.5);
}

.session-icon {
  flex-shrink: 0;
  color: #7c3aed;
}

.prompt-text {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 20px;
  font-size: 11px;
  color: #9ca3af;
}

.meta-project {
  color: #6b7280;
}

.meta-sep {
  color: #d1d5db;
}
</style>
