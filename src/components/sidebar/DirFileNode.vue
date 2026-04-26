<script setup lang="ts">
import type { DirectoryChild } from "../../types/directory";

defineProps<{
  child: DirectoryChild;
  active?: boolean;
}>();

const emit = defineEmits<{
  open: [filePath: string];
}>();
</script>

<template>
  <div class="dir-file-node" :class="{ active }" @click="emit('open', child.filePath)">
    <span class="file-name">{{ child.name }}</span>
  </div>
</template>

<style scoped>
.dir-file-node {
  display: flex;
  align-items: center;
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

.dir-file-node.active {
  background: #d4d4d4;
}

.dir-file-node.active:hover {
  background: #c8c8c8;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
