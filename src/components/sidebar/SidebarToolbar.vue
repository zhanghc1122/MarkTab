<script setup lang="ts">
import { useFileStore } from "../../stores/fileStore";
import { useTabStore } from "../../stores/tabStore";
import { readFileContent, openFileDialog } from "../../services/fileIoService";

const fileStore = useFileStore();
const tabStore = useTabStore();

async function handleOpenFile() {
  const path = await openFileDialog();
  if (!path) return;
  const content = await readFileContent(path);
  const entry = fileStore.addFile(path);
  tabStore.openTab(entry, content);
  fileStore.persistState();
}

function handleNewGroup() {
  const name = prompt("Group name:");
  if (name?.trim()) {
    fileStore.createGroup(name.trim());
    fileStore.persistState();
  }
}
</script>

<template>
  <div class="toolbar">
    <button class="toolbar-btn" title="Open File (Ctrl+O)" @click="handleOpenFile">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9zM2.5 3a.5.5 0 0 0-.5.5V6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5zM14 7H2v5.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V7z"/>
      </svg>
    </button>
    <button class="toolbar-btn" title="New Group" @click="handleNewGroup">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M9.5 1.1l3.4 3.5.1.4v10c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V2c0-.6.4-1 1-1h5.1l.4.1zM9 2H4v13h8V5.5L9 2z"/>
        <path d="M8 8h3v1H8v3H7V9H4V8h3V5h1v3z"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.toolbar-btn:hover {
  background: #e0e0e0;
  color: #1f2937;
}
</style>
