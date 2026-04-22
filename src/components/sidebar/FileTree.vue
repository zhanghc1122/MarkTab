<script setup lang="ts">
import { ref, computed } from "vue";
import FileTreeItem from "./FileTreeItem.vue";
import SortBar from "./SortBar.vue";
import type { SortField, SortOrder } from "../../types/directory";
import { useFileStore } from "../../stores/fileStore";
import { useFileDialog } from "../../composables/useFileDialog";

const fileStore = useFileStore();
const { openFile } = useFileDialog();

const sortField = ref<SortField>("time");
const sortOrder = ref<SortOrder>("desc");

const sortedFiles = computed(() => {
  const files = [...fileStore.files];
  const mul = sortOrder.value === "asc" ? 1 : -1;
  if (sortField.value === "name") {
    files.sort((a, b) => mul * a.fileName.localeCompare(b.fileName));
  } else {
    files.sort((a, b) => mul * (a.lastOpened - b.lastOpened));
  }
  return files;
});
</script>

<template>
  <div class="file-tree">
    <div class="ft-toolbar">
      <div class="ft-actions">
        <button class="icon-btn" @click="openFile" title="Open file">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
          </svg>
        </button>
      </div>
      <SortBar v-model:field="sortField" v-model:order="sortOrder" />
    </div>
    <div v-if="sortedFiles.length" class="ft-list">
      <FileTreeItem
        v-for="file in sortedFiles"
        :key="file.id"
        :file="file"
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

.ft-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 8px;
}

.ft-actions {
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
