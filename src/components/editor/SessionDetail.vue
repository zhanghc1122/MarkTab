<script setup lang="ts">
import { computed } from "vue";
import type { SessionTab } from "../../types/tab";
import { useSessions } from "../../composables/useSessions";

const props = defineProps<{ tab: SessionTab }>();

const { sessions, resumeSession } = useSessions();

const sessionEntry = computed(() =>
  sessions.value.find((s) => s.sessionId === props.tab.sessionId)
);

function handleOpenTerminal() {
  resumeSession(props.tab.sessionId, props.tab.projectPath);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function projectName(path: string): string {
  if (!path) return "";
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || path;
}
</script>

<template>
  <div class="session-detail">
    <div class="sd-card">
      <div class="sd-header">
        <svg class="sd-icon" width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.354L6.694 9H3.5a.5.5 0 0 1-.48-.641l2.5-8z"/>
        </svg>
        <span class="sd-title">{{ tab.fileName }}</span>
      </div>

      <div class="sd-meta">
        <div class="sd-row">
          <span class="sd-label">Project</span>
          <span class="sd-value sd-path">{{ tab.projectPath }}</span>
        </div>
        <div class="sd-row" v-if="sessionEntry">
          <span class="sd-label">Last Activity</span>
          <span class="sd-value">{{ formatDate(sessionEntry.lastTimestamp) }}</span>
        </div>
        <div class="sd-row" v-if="sessionEntry">
          <span class="sd-label">Messages</span>
          <span class="sd-value">{{ sessionEntry.messageCount }}</span>
        </div>
        <div class="sd-row" v-if="sessionEntry">
          <span class="sd-label">Status</span>
          <span class="sd-value">
            <span v-if="sessionEntry.isActive" class="sd-status sd-active">Active</span>
            <span v-else class="sd-status sd-inactive">Inactive</span>
          </span>
        </div>
        <div class="sd-row">
          <span class="sd-label">Session ID</span>
          <span class="sd-value sd-mono">{{ tab.sessionId }}</span>
        </div>
      </div>

      <button class="sd-terminal-btn" @click="handleOpenTerminal">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm1 0v10h10V3H3zm1.5 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"/>
        </svg>
        Open in Terminal
      </button>
    </div>
  </div>
</template>

<style scoped>
.session-detail {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fafafa;
}

.sd-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 32px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sd-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sd-icon {
  color: #7c3aed;
  flex-shrink: 0;
}

.sd-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sd-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sd-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.sd-label {
  font-size: 12px;
  color: #9ca3af;
  min-width: 80px;
  flex-shrink: 0;
}

.sd-value {
  font-size: 13px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sd-path {
  font-size: 12px;
  color: #6b7280;
}

.sd-mono {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  color: #6b7280;
}

.sd-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
}

.sd-active {
  background: #dcfce7;
  color: #166534;
}

.sd-active::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.sd-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.sd-terminal-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #7c3aed;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.sd-terminal-btn:hover {
  background: #6d28d9;
}
</style>
