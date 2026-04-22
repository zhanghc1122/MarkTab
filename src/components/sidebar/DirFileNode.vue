<script setup lang="ts">
import type { DirectoryChild } from "../../types/directory";

defineProps<{
  child: DirectoryChild;
}>();

const emit = defineEmits<{
  open: [filePath: string];
}>();
</script>

<template>
  <div class="dir-file-node" @click="emit('open', child.filePath)">
    <span class="file-icon">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1.5 1.5 0 0 0 13.5 3.5l-2-2A1.5 1.5 0 0 0 10.293 1H4zm0 1h5.5v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/></svg>
    </span>
    <span class="file-name">{{ child.name }}</span>
  </div>
</template>

<style scoped>
.dir-file-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 36px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  transition: background-color 0.15s;
}

.dir-file-node:hover {
  background-color: #f3f4f6;
}

.file-icon {
  flex-shrink: 0;
  color: #6b7280;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
