<script setup lang="ts">
import { useFileStore } from "../../stores/fileStore";
import type { FileEntry, FileGroup } from "../../types/file";
import FileTreeItem from "./FileTreeItem.vue";

const props = defineProps<{
  group: FileGroup;
  files: FileEntry[];
}>();

const fileStore = useFileStore();

function handleToggle() {
  fileStore.toggleGroupCollapse(props.group.id);
  fileStore.persistState();
}

function handleDelete() {
  if (confirm(`Delete group "${props.group.name}"? Files will be moved to ungrouped.`)) {
    fileStore.deleteGroup(props.group.id);
    fileStore.persistState();
  }
}

function handleRename() {
  const name = prompt("Group name:", props.group.name);
  if (name?.trim() && name.trim() !== props.group.name) {
    fileStore.renameGroup(props.group.id, name.trim());
    fileStore.persistState();
  }
}
</script>

<template>
  <div class="group-node">
    <div class="group-header" @click="handleToggle">
      <svg
        class="chevron"
        :class="{ collapsed: group.collapsed }"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M6 3l5 5-5 5V3z"/>
      </svg>
      <span
        v-if="group.color"
        class="group-color"
        :style="{ background: group.color }"
      ></span>
      <span class="group-name">{{ group.name }}</span>
      <span class="group-count">{{ files.length }}</span>
      <div class="group-actions">
        <button class="action-btn" @click.stop="handleRename" title="Rename">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-4.5 1.5a.5.5 0 0 1-.62-.62l1.5-4.5a.5.5 0 0 1 .11-.168l10-10z"/>
          </svg>
        </button>
        <button class="action-btn delete" @click.stop="handleDelete" title="Delete group">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1h2.5a1 1 0 0 1 1 1v1z"/>
          </svg>
        </button>
      </div>
    </div>
    <div v-if="!group.collapsed" class="group-files">
      <FileTreeItem
        v-for="file in files"
        :key="file.id"
        :file="file"
        :active="false"
      />
      <div v-if="files.length === 0" class="empty-group">No files</div>
    </div>
  </div>
</template>

<style scoped>
.group-node {
  margin-bottom: 2px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  cursor: pointer;
  transition: background 0.1s;
}

.group-header:hover {
  background: #e8e8e8;
}

.chevron {
  flex-shrink: 0;
  color: #9ca3af;
  transition: transform 0.15s;
}

.chevron.collapsed {
  transform: rotate(0deg);
}

.chevron:not(.collapsed) {
  transform: rotate(90deg);
}

.group-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.group-name {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-count {
  font-size: 11px;
  color: #9ca3af;
}

.group-actions {
  display: none;
  gap: 1px;
}

.group-header:hover .group-actions {
  display: flex;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
}

.action-btn:hover {
  background: #d4d4d4;
  color: #1f2937;
}

.action-btn.delete:hover {
  color: #ef4444;
}

.group-files {
  padding-left: 0;
}

.empty-group {
  padding: 4px 12px 4px 32px;
  font-size: 11px;
  color: #9ca3af;
}
</style>
