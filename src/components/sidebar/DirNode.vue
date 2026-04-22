<script setup lang="ts">
import { computed } from "vue";
import DirFileNode from "./DirFileNode.vue";
import type { DirectoryEntry } from "../../types/directory";
import { useDirectoryStore } from "../../stores/directoryStore";
import { useDirectoryTree } from "../../composables/useDirectoryTree";

const props = defineProps<{
  entry: DirectoryEntry;
  isFavorite: boolean;
}>();

const dirStore = useDirectoryStore();
const { expandDirectory, openFileFromDir } = useDirectoryTree();

const node = computed(() => dirStore.getNode(props.entry.dirPath));
const isExpanded = computed(() => node.value?.expanded ?? false);

const sortedChildren = computed(() => {
  const children = node.value?.children ?? [];
  if (!children.length) return children;
  const sorted = [...children];
  const mul = dirStore.sortOrder === "asc" ? 1 : -1;
  if (dirStore.sortField === "name") {
    sorted.sort((a, b) => mul * a.name.localeCompare(b.name));
  } else {
    sorted.sort((a, b) => {
      const ta = a.mtime ?? 0;
      const tb = b.mtime ?? 0;
      return mul * (ta - tb);
    });
  }
  return sorted;
});

function toggle() {
  expandDirectory(props.entry.dirPath);
}

function remove() {
  if (props.isFavorite) {
    dirStore.removeFavorite(props.entry.dirPath);
  } else {
    dirStore.removeRecent(props.entry.dirPath);
  }
  dirStore.persistState();
}
</script>

<template>
  <div class="dir-node">
    <div class="dir-header" @click="toggle">
      <span class="chevron" :class="{ expanded: isExpanded }">▶</span>
      <span class="dir-icon"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M.5 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5zM2 5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 5zm1 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 3 7zm1 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 4 9zm.5 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6z"/></svg></span>
      <span class="dir-name" :title="entry.dirPath">{{ entry.dirName }}</span>
      <button class="remove-btn" @click.stop="remove" title="Remove">
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
    <div v-if="isExpanded" class="dir-children">
      <div v-if="node?.loading" class="dir-loading">Loading...</div>
      <template v-else>
        <DirFileNode
          v-for="child in sortedChildren"
          :key="child.filePath"
          :child="child"
          @open="openFileFromDir"
        />
        <div v-if="!(node?.children?.length)" class="dir-empty">
          No .md files
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.dir-node {
  user-select: none;
}

.dir-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  transition: background-color 0.15s;
}

.dir-header:hover {
  background-color: #e0e0e0;
}

.chevron {
  font-size: 9px;
  transition: transform 0.15s;
  flex-shrink: 0;
  opacity: 0.5;
}

.chevron.expanded {
  transform: rotate(90deg);
}

.dir-icon {
  flex-shrink: 0;
  color: #6b7280;
}

.dir-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  flex-shrink: 0;
}

.dir-header:hover .remove-btn {
  display: flex;
}

.remove-btn:hover {
  background: #d4d4d4;
  color: #ef4444;
}

.dir-children {
  padding-left: 4px;
}

.dir-loading,
.dir-empty {
  padding: 4px 8px 4px 36px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
