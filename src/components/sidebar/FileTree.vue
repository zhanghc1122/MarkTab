<script setup lang="ts">
import { computed } from "vue";
import FileTreeItem from "./FileTreeItem.vue";
import type { SortField, SortOrder } from "../../types/directory";
import { useFileStore } from "../../stores/fileStore";
import { useTabStore } from "../../stores/tabStore";

const props = defineProps<{
  sortField: SortField;
  sortOrder: SortOrder;
}>();

const fileStore = useFileStore();
const tabStore = useTabStore();

const sortedFiles = computed(() => {
  const files = [...fileStore.files];
  const mul = props.sortOrder === "asc" ? 1 : -1;
  if (props.sortField === "name") {
    files.sort((a, b) => mul * a.fileName.localeCompare(b.fileName));
  } else {
    files.sort((a, b) => mul * (a.lastOpened - b.lastOpened));
  }
  return files;
});
</script>

<template>
  <div class="file-tree">
    <div v-if="sortedFiles.length" class="ft-list">
      <FileTreeItem
        v-for="file in sortedFiles"
        :key="file.id"
        :file="file"
        :active="tabStore.activeTab?.filePath === file.filePath"
      />
    </div>
    <div v-else class="ft-empty">
      <div class="ft-empty-icon"><svg width="36" height="36" viewBox="0 0 16 16" fill="currentColor"><path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1.5 1.5 0 0 0 13.5 3.5l-2-2A1.5 1.5 0 0 0 10.293 1H4zm0 1h5.5v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/></svg></div>
      <div class="ft-empty-text">No recent files</div>
    </div>
  </div>
</template>

<style scoped>
.file-tree {
  padding: 8px 0;
}

.ft-list {
  padding: 0;
}

.ft-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
}

.ft-empty-icon {
  color: #d1d5db;
}

.ft-empty-text {
  font-size: 13px;
  color: #9ca3af;
}
</style>