<script setup lang="ts">
import { ref } from "vue";
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

const showDeleteError = ref(false);

async function handleOpen() {
  const status = props.file.fileStatus;
  if (status === "deleted") {
    showDeleteError.value = true;
    return;
  }

  try {
    const content = await readFileContent(props.file.filePath);
    tabStore.openTab(props.file, content);
    if (props.file.fileStatus === "modified") {
      props.file.fileStatus = undefined;
    }
  } catch (e) {
    await fileStore.checkFileStatus(props.file.id);
    if (props.file.fileStatus === "deleted") {
      showDeleteError.value = true;
    } else {
      console.error("Failed to open file:", e);
    }
  }
}

function handleRemove(e: MouseEvent) {
  e.stopPropagation();
  fileStore.removeFile(props.file.id);
  fileStore.persistState();
}

function handleDismissError() {
  showDeleteError.value = false;
}

function handleRemoveDeleted() {
  fileStore.removeFile(props.file.id);
  fileStore.persistState();
  showDeleteError.value = false;
}
</script>

<template>
  <div
    class="file-item"
    :class="{
      active,
      'file-deleted': file.fileStatus === 'deleted',
      'file-modified': file.fileStatus === 'modified',
    }"
    @click="handleOpen"
    :title="
      file.fileStatus === 'deleted'
        ? 'File not found on disk'
        : file.fileStatus === 'modified'
          ? 'File modified externally'
          : file.filePath
    "
  >
    <svg
      v-if="file.fileStatus === 'deleted'"
      class="file-icon icon-deleted"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path
        d="M5.5 5.5A.5.5 0 0 1 6 6v3a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2 0A.5.5 0 0 1 8 6v3a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2 0A.5.5 0 0 1 10 6v3a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"
      />
      <path
        d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"
      />
    </svg>
    <svg
      v-else
      class="file-icon"
      :class="{ 'icon-modified': file.fileStatus === 'modified' }"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path
        d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 0v4.5H14L9.5 0z"
      />
    </svg>
    <span class="file-name">{{ file.fileName }}</span>
    <span v-if="file.fileStatus === 'modified'" class="modified-dot"></span>
    <button class="remove-btn" @click="handleRemove" title="Remove from list">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path
          d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </button>
  </div>
  <div v-if="showDeleteError" class="delete-error">
    <span class="delete-error-text">File not found on disk</span>
    <button class="delete-error-btn btn-remove" @click="handleRemoveDeleted">
      Remove
    </button>
    <button class="delete-error-btn btn-dismiss" @click="handleDismissError">
      Dismiss
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

.icon-deleted {
  color: #ef4444;
}

.icon-modified {
  color: #f59e0b;
}

.file-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-deleted .file-name {
  text-decoration: line-through;
  color: #9ca3af;
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

.modified-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  flex-shrink: 0;
}

.delete-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 32px;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
  font-size: 12px;
}

.delete-error-text {
  flex: 1;
  color: #991b1b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-error-btn {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  border: 1px solid;
  flex-shrink: 0;
}

.btn-remove {
  background: #ef4444;
  border-color: #dc2626;
  color: #fff;
}

.btn-remove:hover {
  background: #dc2626;
}

.btn-dismiss {
  background: transparent;
  border-color: #9ca3af;
  color: #6b7280;
}

.btn-dismiss:hover {
  background: #f3f4f6;
  color: #374151;
}
</style>
