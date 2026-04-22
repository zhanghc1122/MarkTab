<script setup lang="ts">
import { computed } from "vue";
import { useTabStore } from "../../stores/tabStore";
import { readFileContent } from "../../services/fileIoService";

const props = defineProps<{
  name: string;
  filePath: string;
}>();

const tabStore = useTabStore();

const isActive = computed(() => tabStore.activeTab?.filePath === props.filePath);

async function openFile() {
  try {
    const content = await readFileContent(props.filePath);
    const fileEntry = {
      id: props.filePath,
      filePath: props.filePath,
      fileName: props.name,
      lastOpened: Date.now(),
    };
    tabStore.openTab(fileEntry, content);
  } catch {
    // ignore read errors
  }
}
</script>

<template>
  <div
    class="skill-file-node"
    :class="{ active: isActive }"
    @click="openFile"
  >
    <span class="file-icon"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1.5 1.5 0 0 0 13.5 3.5l-2-2A1.5 1.5 0 0 0 10.293 1H4zm0 1h5.5v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/></svg></span>
    <span class="file-name">{{ name }}</span>
  </div>
</template>

<style scoped>
.skill-file-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 36px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: #6b7280;
  transition: background-color 0.15s;
}

.skill-file-node:hover {
  background-color: #e0e0e0;
}

.skill-file-node.active {
  background-color: #ede9fe;
  color: #1f2937;
}

.file-icon {
  flex-shrink: 0;
  font-size: 12px;
  opacity: 0.7;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
