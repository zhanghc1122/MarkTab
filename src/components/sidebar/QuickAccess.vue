<script setup lang="ts">
import { computed } from "vue";
import DirNode from "./DirNode.vue";
import SortBar from "./SortBar.vue";
import { useDirectoryStore } from "../../stores/directoryStore";
import { useFileDialog } from "../../composables/useFileDialog";
import { openDirectoryDialog } from "../../services/fileIoService";

const dirStore = useDirectoryStore();
const { openFile } = useFileDialog();

async function addFavorite() {
  const dirPath = await openDirectoryDialog();
  if (!dirPath) return;
  dirStore.addFavorite(dirPath);
  dirStore.persistState();
}

function sortDirs(dirs: typeof dirStore.favoriteDirs) {
  const sorted = [...dirs];
  const mul = dirStore.sortOrder === "asc" ? 1 : -1;
  if (dirStore.sortField === "name") {
    sorted.sort((a, b) => mul * a.dirName.localeCompare(b.dirName));
  } else {
    sorted.sort((a, b) => mul * (a.lastAccessed - b.lastAccessed));
  }
  return sorted;
}

const sortedFavorites = computed(() => sortDirs(dirStore.favoriteDirs));
const sortedRecents = computed(() => sortDirs(dirStore.recentDirs));
</script>

<template>
  <div class="quick-access">
    <div class="qa-toolbar">
      <div class="qa-actions">
        <button class="icon-btn" @click="openFile" title="Open file">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
          </svg>
        </button>
        <button class="icon-btn" @click="addFavorite" title="Add folder to favorites">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M.5 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5zM2 5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 5zm1 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 3 7zm1 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 4 9zm.5 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6z"/>
          </svg>
        </button>
      </div>
      <SortBar v-model:field="dirStore.sortField" v-model:order="dirStore.sortOrder" />
    </div>

    <div v-if="dirStore.favoriteDirs.length" class="qa-section">
      <div class="qa-section-title">Favorites</div>
      <DirNode
        v-for="dir in sortedFavorites"
        :key="'fav-' + dir.dirPath"
        :entry="dir"
        :is-favorite="true"
      />
    </div>

    <div v-if="dirStore.recentDirs.length" class="qa-section">
      <div class="qa-section-title">Recent</div>
      <DirNode
        v-for="dir in sortedRecents"
        :key="'rec-' + dir.dirPath"
        :entry="dir"
        :is-favorite="false"
      />
    </div>

    <div v-if="!dirStore.favoriteDirs.length && !dirStore.recentDirs.length" class="qa-empty">
      <div class="qa-empty-icon"><svg width="36" height="36" viewBox="0 0 16 16" fill="currentColor"><path d="M.5 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5zM2 5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 5zm1 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 3 7zm1 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 4 9zm.5 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6z"/></svg></div>
      <div class="qa-empty-text">Open files or add folders to see them here</div>
    </div>
  </div>
</template>

<style scoped>
.quick-access {
  padding: 8px 0;
}

.qa-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 8px;
}

.qa-actions {
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

.qa-section {
  margin-bottom: 4px;
}

.qa-section-title {
  padding: 6px 12px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.qa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
}

.qa-empty-icon {
  color: #d1d5db;
}

.qa-empty-text {
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}
</style>
