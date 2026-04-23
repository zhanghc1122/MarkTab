<script setup lang="ts">
import type { SidebarView } from "../../types/config";
import type { SortField, SortOrder } from "../../types/directory";
import SortBar, { type SortFieldDef } from "./SortBar.vue";
import { useDirectoryStore } from "../../stores/directoryStore";

type SessionSortField = "time" | "project" | "messages";

defineProps<{
  view: SidebarView;
  fileSortField: SortField;
  fileSortOrder: SortOrder;
  sessionSortField: SessionSortField;
  sessionSortOrder: SortOrder;
  sessionSearchQuery: string;
}>();

const emit = defineEmits<{
  "update:fileSortField": [value: SortField];
  "update:fileSortOrder": [value: SortOrder];
  "update:sessionSortField": [value: SessionSortField];
  "update:sessionSortOrder": [value: SortOrder];
  "update:sessionSearchQuery": [value: string];
  openFile: [];
  addFolder: [];
  refreshSessions: [];
}>();

const dirStore = useDirectoryStore();

const fileSortFields: SortFieldDef[] = [
  { key: "name", title: "Sort by name", defaultOrder: "asc" },
  { key: "time", title: "Sort by time", defaultOrder: "desc" },
];

const sessionSortFields: SortFieldDef[] = [
  { key: "time", title: "Sort by time", defaultOrder: "desc" },
  { key: "project", title: "Sort by project", defaultOrder: "asc" },
  { key: "messages", title: "Sort by messages", defaultOrder: "desc" },
];
</script>

<template>
  <div v-if="view !== 'skills'" class="sidebar-toolbar">
    <div class="toolbar-left">
      <button
        v-if="view === 'files' || view === 'quickAccess'"
        class="icon-btn"
        title="Open File (Ctrl+O)"
        @click="emit('openFile')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
        </svg>
      </button>
      <button
        v-if="view === 'quickAccess'"
        class="icon-btn"
        title="Add folder to favorites"
        @click="emit('addFolder')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3H13.5a2 2 0 0 1 2 1.99V13a2 2 0 0 1-2 2H2.5a2 2 0 0 1-2-2V5.01a2 2 0 0 1 .04-.14ZM1 5v8a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 15 13V5a1.5 1.5 0 0 0-1.5-1.5H2.5A1.5 1.5 0 0 0 1 5z"/>
        </svg>
      </button>
      <button
        v-if="view === 'sessions'"
        class="icon-btn"
        title="Refresh sessions"
        @click="emit('refreshSessions')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
        </svg>
      </button>
    </div>
    <div class="toolbar-right">
      <template v-if="view === 'files'">
        <SortBar
          :field="fileSortField"
          :order="fileSortOrder"
          :fields="fileSortFields"
          @update:field="emit('update:fileSortField', $event as SortField)"
          @update:order="emit('update:fileSortOrder', $event)"
        >
          <template #icon-name>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5z"/>
            </svg>
          </template>
          <template #icon-time>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
          </template>
        </SortBar>
      </template>
      <template v-else-if="view === 'quickAccess'">
        <SortBar
          :field="dirStore.sortField"
          :order="dirStore.sortOrder"
          :fields="fileSortFields"
          @update:field="dirStore.sortField = $event as SortField"
          @update:order="dirStore.sortOrder = $event"
        >
          <template #icon-name>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5z"/>
            </svg>
          </template>
          <template #icon-time>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
          </template>
        </SortBar>
      </template>
      <template v-else-if="view === 'sessions'">
        <SortBar
          :field="sessionSortField"
          :order="sessionSortOrder"
          :fields="sessionSortFields"
          @update:field="emit('update:sessionSortField', $event as SessionSortField)"
          @update:order="emit('update:sessionSortOrder', $event)"
        >
          <template #icon-time>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
          </template>
          <template #icon-project>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5z"/>
            </svg>
          </template>
          <template #icon-messages>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.854V2z"/>
            </svg>
          </template>
        </SortBar>
      </template>
    </div>
    <div v-if="view === 'sessions'" class="toolbar-search">
      <input
        :value="sessionSearchQuery"
        type="text"
        placeholder="Search sessions..."
        class="search-input"
        @input="emit('update:sessionSearchQuery', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.sidebar-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar-left {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.toolbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.toolbar-search {
  flex: 1;
  min-width: 0;
}

.search-input {
  width: 100%;
  padding: 3px 6px;
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

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
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
</style>