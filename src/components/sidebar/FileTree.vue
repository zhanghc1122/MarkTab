<script setup lang="ts">
import { useFileStore } from "../../stores/fileStore";
import { useTabStore } from "../../stores/tabStore";
import GroupNode from "./GroupNode.vue";
import FileTreeItem from "./FileTreeItem.vue";

const fileStore = useFileStore();
const tabStore = useTabStore();
</script>

<template>
  <div class="file-tree" v-if="fileStore.files.length > 0 || fileStore.groups.length > 0">
    <!-- Groups -->
    <GroupNode
      v-for="group in [...fileStore.groups].sort((a, b) => a.order - b.order)"
      :key="group.id"
      :group="group"
      :files="fileStore.getGroupFiles(group.id)"
    />

    <!-- Ungrouped files -->
    <div v-if="fileStore.ungroupedFiles.length > 0" class="ungrouped-section">
      <div v-if="fileStore.groups.length > 0" class="section-label">Ungrouped</div>
      <FileTreeItem
        v-for="file in fileStore.ungroupedFiles"
        :key="file.id"
        :file="file"
        :active="tabStore.activeTab?.filePath === file.filePath"
      />
    </div>
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

.section-label {
  padding: 6px 16px 2px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ungrouped-section {
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
