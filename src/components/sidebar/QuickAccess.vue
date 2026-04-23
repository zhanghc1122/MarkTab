<script setup lang="ts">
import { computed } from "vue";
import DirNode from "./DirNode.vue";
import { useDirectoryStore } from "../../stores/directoryStore";

const dirStore = useDirectoryStore();

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
      <div class="qa-empty-icon"><svg width="36" height="36" viewBox="0 0 16 16" fill="currentColor"><path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3H13.5a2 2 0 0 1 2 1.99V13a2 2 0 0 1-2 2H2.5a2 2 0 0 1-2-2V5.01a2 2 0 0 1 .04-.14ZM1 5v8a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 15 13V5a1.5 1.5 0 0 0-1.5-1.5H2.5A1.5 1.5 0 0 0 1 5z"/></svg></div>
      <div class="qa-empty-text">Open files or add folders to see them here</div>
    </div>
  </div>
</template>

<style scoped>
.quick-access {
  padding: 8px 0;
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