<script setup lang="ts">
import { computed, onMounted } from "vue";
import SessionItem from "./SessionItem.vue";
import { useTabStore } from "../../stores/tabStore";
import { useSessions } from "../../composables/useSessions";

type SessionSortField = "time" | "project" | "messages";
type SessionSortOrder = "asc" | "desc";

const props = defineProps<{
  sortField: SessionSortField;
  sortOrder: SessionSortOrder;
  searchQuery: string;
}>();

const { sessions, loading, error } = useSessions();
const tabStore = useTabStore();

onMounted(() => {
  // Sessions are loaded by the toolbar's refresh action
});

const filteredSessions = computed(() => {
  let list = sessions.value;

  if (props.searchQuery.trim()) {
    const q = props.searchQuery.toLowerCase();
    list = list.filter(
      (s) =>
        s.firstPrompt.toLowerCase().includes(q) ||
        s.projectPath.toLowerCase().includes(q)
    );
  }

  const mul = props.sortOrder === "asc" ? 1 : -1;
  const sorted = [...list];
  if (props.sortField === "time") {
    sorted.sort((a, b) => mul * (a.lastTimestamp - b.lastTimestamp));
  } else if (props.sortField === "project") {
    sorted.sort((a, b) => mul * a.projectPath.localeCompare(b.projectPath));
  } else {
    sorted.sort((a, b) => mul * (a.messageCount - b.messageCount));
  }
  return sorted;
});

function handleSelect(sessionId: string, projectPath: string, firstPrompt: string) {
  tabStore.openSessionTab(sessionId, firstPrompt, projectPath);
}
</script>

<template>
  <div class="sessions-list">
    <div v-if="loading" class="sl-loading">Loading sessions...</div>
    <div v-else-if="error" class="sl-error">{{ error }}</div>
    <div v-else-if="filteredSessions.length" class="sl-list">
      <SessionItem
        v-for="session in filteredSessions"
        :key="session.sessionId"
        :session="session"
        @select="handleSelect"
      />
    </div>
    <div v-else class="sl-empty">
      <div class="sl-empty-icon">
        <svg width="36" height="36" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.354L6.694 9H3.5a.5.5 0 0 1-.48-.641l2.5-8z"/>
        </svg>
      </div>
      <div class="sl-empty-text">No Claude Code sessions found</div>
    </div>
  </div>
</template>

<style scoped>
.sessions-list {
  padding: 8px 0;
}

.sl-list {
  padding: 0;
}

.sl-loading,
.sl-error {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

.sl-error {
  color: #ef4444;
}

.sl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
}

.sl-empty-icon {
  color: #d1d5db;
}

.sl-empty-text {
  font-size: 13px;
  color: #9ca3af;
}
</style>