<script setup lang="ts">
import { useFileStore } from "../../stores/fileStore";
import { useTabStore } from "../../stores/tabStore";
import FileTreeItem from "./FileTreeItem.vue";

const fileStore = useFileStore();
const tabStore = useTabStore();
</script>

<template>
  <div class="file-tree" v-if="fileStore.files.length > 0">
    <FileTreeItem
      v-for="file in fileStore.sortedFiles"
      :key="file.id"
      :file="file"
      :active="tabStore.activeTab?.filePath === file.filePath"
    />
  </div>

  <div v-else class="empty-tree">
    <span class="empty-text">No files yet</span>
    <span class="empty-hint">Open a markdown file to get started</span>
  </div>
</template>

<style scoped>
.file-tree {
  display: flex;
  flex-direction: column;
}

.empty-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  gap: 8px;
}

.empty-text {
  color: #9ca3af;
  font-size: 13px;
}

.empty-hint {
  color: #9ca3af;
  font-size: 11px;
}
</style>
