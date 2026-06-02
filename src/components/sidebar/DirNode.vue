<script setup lang="ts">
import { computed } from "vue";
import DirFileNode from "./DirFileNode.vue";
import type { DirectoryEntry, DirectoryChild } from "../../types/directory";
import { useDirectoryStore } from "../../stores/directoryStore";
import { useTabStore } from "../../stores/tabStore";
import { useDirectoryTree } from "../../composables/useDirectoryTree";

const props = defineProps<{
  entry: DirectoryEntry;
  isFavorite: boolean;
}>();

const dirStore = useDirectoryStore();
const tabStore = useTabStore();
const { expandDirectory, openFileFromDir } = useDirectoryTree();

const node = computed(() => dirStore.getNode(props.entry.dirPath));
const isExpanded = computed(() => node.value?.expanded ?? false);

function sortChildren(children: DirectoryChild[]): DirectoryChild[] {
  if (!children.length) return children;
  const sorted = [...children];
  const mul = dirStore.sortOrder === "asc" ? 1 : -1;
  if (dirStore.sortField === "name") {
    sorted.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return mul * a.name.localeCompare(b.name);
    });
  } else {
    sorted.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      const ta = a.mtime ?? 0;
      const tb = b.mtime ?? 0;
      return mul * (ta - tb);
    });
  }
  return sorted;
}

const sortedChildren = computed(() => sortChildren(node.value?.children ?? []));

const nestedSorted = computed(() => {
  const map = new Map<string, DirectoryChild[]>();
  for (const child of sortedChildren.value) {
    if (child.isDir) {
      map.set(child.filePath, sortChildren(dirStore.getNode(child.filePath)?.children ?? []));
    }
  }
  return map;
});

function toggle() {
  if (props.isFavorite) {
    dirStore.touchFavorite(props.entry.dirPath);
  }
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

function retry() {
  expandDirectory(props.entry.dirPath);
}

async function toggleChildDir(child: DirectoryChild) {
  if (!child.isDir) return;
  await expandDirectory(child.filePath);
}
</script>

<template>
  <div class="dir-node">
    <div
      class="dir-header"
      :class="{ 'has-error': node?.error }"
      tabindex="0"
      role="button"
      :aria-expanded="isExpanded"
      :aria-label="`${entry.dirName}, ${isExpanded ? 'expanded' : 'collapsed'}`"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <span class="chevron" :class="{ expanded: isExpanded }" aria-hidden="true">▶</span>
      <span v-if="node?.error" class="error-icon" aria-hidden="true">⚠</span>
      <span class="dir-name" :title="entry.dirPath">{{ entry.dirName }}</span>
      <button
        class="remove-btn"
        @click.stop="remove"
        :aria-label="isFavorite ? 'Remove from favorites' : 'Remove from recent'"
        :title="isFavorite ? 'Remove from favorites' : 'Remove from recent'"
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
    <div v-if="isExpanded" class="dir-children">
      <div v-if="node?.loading" class="dir-loading">Loading...</div>
      <div v-else-if="node?.error" class="dir-error">
        <div class="dir-error-text">
          {{ node.error === "broken" ? "Folder missing" : "Unable to read folder" }}
        </div>
        <div class="dir-error-actions">
          <button
            v-if="node.error === 'unreadable'"
            class="dir-error-btn"
            @click="retry"
          >Retry</button>
          <button class="dir-error-btn" @click="remove">Remove</button>
        </div>
      </div>
      <template v-else>
        <template v-for="child in sortedChildren" :key="child.filePath">
          <div v-if="child.isDir" class="child-dir" @click="toggleChildDir(child)">
            <span class="chevron" :class="{ expanded: dirStore.getNode(child.filePath)?.expanded }">▶</span>
            <span class="child-dir-name">{{ child.name }}</span>
          </div>
          <div v-if="child.isDir && dirStore.getNode(child.filePath)?.expanded" class="child-dir-content">
            <template v-for="subChild in nestedSorted.get(child.filePath) ?? []" :key="subChild.filePath">
              <div v-if="subChild.isDir" class="child-dir" @click="toggleChildDir(subChild)">
                <span class="chevron" :class="{ expanded: dirStore.getNode(subChild.filePath)?.expanded }">▶</span>
                <span class="child-dir-name">{{ subChild.name }}</span>
              </div>
              <div v-if="subChild.isDir && dirStore.getNode(subChild.filePath)?.expanded" class="child-dir-content">
                <DirFileNode
                  v-for="deepChild in nestedSorted.get(subChild.filePath) ?? []"
                  :key="deepChild.filePath"
                  :child="deepChild"
                  :active="tabStore.activeTab?.filePath === deepChild.filePath"
                  @open="openFileFromDir"
                />
              </div>
              <DirFileNode
                v-else-if="!subChild.isDir"
                :child="subChild"
                :active="tabStore.activeTab?.filePath === subChild.filePath"
                @open="openFileFromDir"
              />
            </template>
          </div>
          <DirFileNode
            v-else-if="!child.isDir"
            :child="child"
            :active="tabStore.activeTab?.filePath === child.filePath"
            @open="openFileFromDir"
          />
        </template>
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

.dir-header:hover,
.dir-header:focus-visible {
  background-color: #e0e0e0;
  outline: none;
}

.dir-header.has-error {
  color: #b45309;
}

.dir-header:focus-visible {
  box-shadow: inset 0 0 0 1px #7c3aed;
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

.dir-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  display: flex;
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
  opacity: 0;
  transition: opacity 0.15s, background-color 0.15s, color 0.15s;
}

.dir-header:hover .remove-btn,
.dir-header:focus-within .remove-btn,
.remove-btn:focus-visible {
  opacity: 1;
}

.remove-btn:hover {
  background: #d4d4d4;
  color: #ef4444;
}

.remove-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 1px #7c3aed;
}

.error-icon {
  font-size: 12px;
  color: #b45309;
  flex-shrink: 0;
}

.dir-error {
  padding: 6px 8px 6px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #b45309;
}

.dir-error-text {
  font-style: italic;
}

.dir-error-actions {
  display: flex;
  gap: 6px;
}

.dir-error-btn {
  border: 1px solid #fcd34d;
  background: #fffbeb;
  color: #92400e;
  border-radius: 3px;
  padding: 1px 8px;
  font-size: 11px;
  cursor: pointer;
}

.dir-error-btn:hover {
  background: #fef3c7;
}

.dir-children {
  padding-left: 4px;
}

.dir-loading,
.dir-empty {
  padding: 4px 8px 4px 24px;
  font-size: 12px;
  color: #9ca3af;
}

.child-dir {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px 4px 20px;
  cursor: pointer;
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
  transition: background-color 0.15s;
}

.child-dir:hover {
  background-color: #e0e0e0;
}

.child-dir-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-dir-content {
  padding-left: 12px;
}
</style>
