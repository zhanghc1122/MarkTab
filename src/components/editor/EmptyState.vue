<script setup lang="ts">
import { openFileDialog, readFileContent } from "../../services/fileIoService";
import { useFileStore } from "../../stores/fileStore";
import { useTabStore } from "../../stores/tabStore";

const fileStore = useFileStore();
const tabStore = useTabStore();

async function handleOpen() {
  const path = await openFileDialog();
  if (!path) return;
  const content = await readFileContent(path);
  const entry = fileStore.addFile(path);
  tabStore.openTab(entry, content);
  fileStore.persistState();
}
</script>

<template>
  <div class="empty-state">
    <svg width="48" height="48" viewBox="0 0 16 16" fill="#45475a">
      <path d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 0v4.5H14L9.5 0zM8 7.5a.5.5 0 0 0-1 0v2h-2a.5.5 0 0 0 0 1h2v2a.5.5 0 0 0 1 0v-2h2a.5.5 0 0 0 0-1h-2v-2z"/>
    </svg>
    <p class="empty-title">No file open</p>
    <p class="empty-hint">Open a markdown file to get started</p>
    <button class="open-btn" @click="handleOpen">Open File</button>
  </div>
</template>

<style scoped>
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #9ca3af;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}

.empty-hint {
  font-size: 13px;
}

.open-btn {
  margin-top: 8px;
  padding: 8px 20px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #e8e8e8;
  color: #1f2937;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.open-btn:hover {
  background: #d4d4d4;
  border-color: #b0b0b0;
}
</style>
