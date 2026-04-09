<script setup lang="ts">
import { useFileStore } from "../../stores/fileStore";
import { useTabStore } from "../../stores/tabStore";
import { readFileContent } from "../../services/fileIoService";
import type { FileEntry } from "../../types/file";

const props = defineProps<{
  file: FileEntry;
  active: boolean;
}>();

const fileStore = useFileStore();
const tabStore = useTabStore();

async function handleOpen() {
  try {
    const content = await readFileContent(props.file.filePath);
    tabStore.openTab(props.file, content);
  } catch (e) {
    console.error("Failed to open file:", e);
  }
}

function handleRemove(e: MouseEvent) {
  e.stopPropagation();
  fileStore.removeFile(props.file.id);
  fileStore.persistState();
}
</script>

<template>
  <div
    class="file-item"
    :class="{ active }"
    @click="handleOpen"
    :title="file.filePath"
  >
    <svg class="file-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 0v4.5H14L9.5 0z"/>
    </svg>
    <span class="file-name">{{ file.fileName }}</span>
    <button class="remove-btn" @click="handleRemove" title="Remove from list">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 16px;
  cursor: pointer;
  border-radius: 0;
  transition: background 0.1s;
  position: relative;
}

.file-item:hover {
  background: #e8e8e8;
}

.file-item.active {
  background: #d4d4d4;
}

.file-icon {
  flex-shrink: 0;
  color: #3b82f6;
}

.file-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  flex-shrink: 0;
}

.file-item:hover .remove-btn {
  display: flex;
}

.remove-btn:hover {
  background: #d4d4d4;
  color: #ef4444;
}
</style>
