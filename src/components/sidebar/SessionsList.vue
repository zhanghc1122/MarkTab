<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import SessionItem from "./SessionItem.vue";
import { useTabStore } from "../../stores/tabStore";
import { useSessions } from "../../composables/useSessions";

const { sessions, loading, error, loadSessions } = useSessions();
const tabStore = useTabStore();

type SessionSortField = "time" | "project" | "messages";
type SessionSortOrder = "asc" | "desc";

const sortField = ref<SessionSortField>("time");
const sortOrder = ref<SessionSortOrder>("desc");
const searchQuery = ref("");

onMounted(() => {
  loadSessions();
});

const filteredSessions = computed(() => {
  let list = sessions.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (s) =>
        s.firstPrompt.toLowerCase().includes(q) ||
        s.projectPath.toLowerCase().includes(q)
    );
  }

  const mul = sortOrder.value === "asc" ? 1 : -1;
  const sorted = [...list];
  if (sortField.value === "time") {
    sorted.sort((a, b) => mul * (a.lastTimestamp - b.lastTimestamp));
  } else if (sortField.value === "project") {
    sorted.sort((a, b) => mul * a.projectPath.localeCompare(b.projectPath));
  } else {
    sorted.sort((a, b) => mul * (a.messageCount - b.messageCount));
  }
  return sorted;
});

function toggleSort(field: SessionSortField) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = field === "project" ? "asc" : "desc";
  }
}

function handleSelect(sessionId: string, projectPath: string, firstPrompt: string) {
  tabStore.openSessionTab(sessionId, firstPrompt, projectPath);
}
</script>

<template>
  <div class="sessions-list">
    <div class="sl-toolbar">
      <div class="sl-actions">
        <button class="icon-btn" @click="loadSessions" title="Refresh sessions">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>
      </div>
      <div class="sl-sort">
        <button
          class="sort-btn"
          :class="{ active: sortField === 'time' }"
          @click="toggleSort('time')"
          :title="sortField === 'time' ? (sortOrder === 'desc' ? 'Newest first' : 'Oldest first') : 'Sort by time'"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
          </svg>
          <svg v-if="sortField === 'time'" width="10" height="10" viewBox="0 0 16 16" fill="currentColor" class="sort-arrow">
            <path v-if="sortOrder === 'asc'" d="M8 15a.5.5 0 0 0 .5-.5V4.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 4.707V14.5a.5.5 0 0 0 .5.5z"/>
            <path v-else d="M8 1a.5.5 0 0 0-.5.5v9.793L5.354 9.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 11.293V1.5A.5.5 0 0 0 8 1z"/>
          </svg>
        </button>
        <button
          class="sort-btn"
          :class="{ active: sortField === 'project' }"
          @click="toggleSort('project')"
          :title="sortField === 'project' ? (sortOrder === 'asc' ? 'A→Z' : 'Z→A') : 'Sort by project'"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5z"/>
          </svg>
          <svg v-if="sortField === 'project'" width="10" height="10" viewBox="0 0 16 16" fill="currentColor" class="sort-arrow">
            <path v-if="sortOrder === 'asc'" d="M8 15a.5.5 0 0 0 .5-.5V4.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 4.707V14.5a.5.5 0 0 0 .5.5z"/>
            <path v-else d="M8 1a.5.5 0 0 0-.5.5v9.793L5.354 9.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 11.293V1.5A.5.5 0 0 0 8 1z"/>
          </svg>
        </button>
        <button
          class="sort-btn"
          :class="{ active: sortField === 'messages' }"
          @click="toggleSort('messages')"
          :title="sortField === 'messages' ? (sortOrder === 'desc' ? 'Most messages' : 'Fewest messages') : 'Sort by message count'"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.854V2z"/>
          </svg>
          <svg v-if="sortField === 'messages'" width="10" height="10" viewBox="0 0 16 16" fill="currentColor" class="sort-arrow">
            <path v-if="sortOrder === 'asc'" d="M8 15a.5.5 0 0 0 .5-.5V4.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 4.707V14.5a.5.5 0 0 0 .5.5z"/>
            <path v-else d="M8 1a.5.5 0 0 0-.5.5v9.793L5.354 9.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 11.293V1.5A.5.5 0 0 0 8 1z"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="sl-search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search sessions..."
        class="search-input"
      />
    </div>
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

.sl-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 8px;
}

.sl-actions {
  display: flex;
  gap: 2px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.icon-btn:hover {
  background: #e5e7eb;
  color: #7c3aed;
}

.sl-sort {
  display: flex;
  gap: 1px;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.sort-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.sort-btn.active {
  color: #7c3aed;
  background: #ede9fe;
}

.sort-arrow {
  flex-shrink: 0;
}

.sl-search {
  padding: 0 10px 8px;
}

.search-input {
  width: 100%;
  padding: 5px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  background: #fff;
  color: #374151;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #7c3aed;
}

.search-input::placeholder {
  color: #9ca3af;
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
