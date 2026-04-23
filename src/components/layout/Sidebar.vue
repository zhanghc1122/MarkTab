<script setup lang="ts">
import { ref, computed, watch } from "vue";
import SidebarHeader from "../sidebar/SidebarHeader.vue";
import SidebarToolbar from "../sidebar/SidebarToolbar.vue";
import FileTree from "../sidebar/FileTree.vue";
import QuickAccess from "../sidebar/QuickAccess.vue";
import SessionsList from "../sidebar/SessionsList.vue";
import SkillsTree from "../sidebar/SkillsTree.vue";
import { useAppConfigStore } from "../../stores/appConfigStore";
import { useFileDialog } from "../../composables/useFileDialog";
import { useDirectoryStore } from "../../stores/directoryStore";
import { openDirectoryDialog } from "../../services/fileIoService";
import { useSessions } from "../../composables/useSessions";
import type { SortField, SortOrder } from "../../types/directory";

const configStore = useAppConfigStore();
const dirStore = useDirectoryStore();
const { openFile } = useFileDialog();
const { loadSessions } = useSessions();

const sidebarWidth = computed(() => configStore.config.preferences.sidebarWidth ?? 260);
const sidebarView = computed(() => configStore.config.preferences.sidebarView);

// Files view sort state
const fileSortField = ref<SortField>("time");
const fileSortOrder = ref<SortOrder>("desc");

// Sessions view sort/search state
type SessionSortField = "time" | "project" | "messages";
const sessionSortField = ref<SessionSortField>("time");
const sessionSortOrder = ref<SortOrder>("desc");
const sessionSearchQuery = ref("");

async function handleAddFolder() {
  const dirPath = await openDirectoryDialog();
  if (!dirPath) return;
  dirStore.addFavorite(dirPath);
  dirStore.persistState();
}

function handleRefreshSessions() {
  loadSessions();
}

watch(sidebarView, (view) => {
  if (view === "sessions") loadSessions();
}, { immediate: true });
</script>

<template>
  <aside class="sidebar" :style="{ width: sidebarWidth + 'px' }">
    <SidebarHeader :view="sidebarView" @update:view="configStore.setSidebarView" />
    <SidebarToolbar
      :view="sidebarView"
      :file-sort-field="fileSortField"
      :file-sort-order="fileSortOrder"
      :session-sort-field="sessionSortField"
      :session-sort-order="sessionSortOrder"
      :session-search-query="sessionSearchQuery"
      @update:file-sort-field="fileSortField = $event"
      @update:file-sort-order="fileSortOrder = $event"
      @update:session-sort-field="sessionSortField = $event"
      @update:session-sort-order="sessionSortOrder = $event"
      @update:session-search-query="sessionSearchQuery = $event"
      @open-file="openFile"
      @add-folder="handleAddFolder"
      @refresh-sessions="handleRefreshSessions"
    />
    <div class="sidebar-content">
      <FileTree v-if="sidebarView === 'files'" :sort-field="fileSortField" :sort-order="fileSortOrder" />
      <QuickAccess v-else-if="sidebarView === 'quickAccess'" />
      <SessionsList
        v-else-if="sidebarView === 'sessions'"
        :sort-field="sessionSortField"
        :sort-order="sessionSortOrder"
        :search-query="sessionSearchQuery"
      />
      <SkillsTree v-else-if="sidebarView === 'skills'" />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  min-width: 200px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
  background: #f5f5f5;
  user-select: none;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}
</style>