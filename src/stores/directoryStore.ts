import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { DirectoryEntry, DirectoryNode, SortField, SortOrder } from "../types/directory";
import { extractDirName, extractParentDir, normalizePathForComparison } from "../utils/pathUtils";
import { useAppConfigStore } from "./appConfigStore";

const MAX_RECENT_DIRS = 10;

export const useDirectoryStore = defineStore("directory", () => {
  const favoriteDirs = ref<DirectoryEntry[]>([]);
  const recentDirs = ref<DirectoryEntry[]>([]);
  const expandedNodes = ref<Map<string, DirectoryNode>>(new Map());
  const sortField = ref<SortField>("name");
  const sortOrder = ref<SortOrder>("asc");

  watch([sortField, sortOrder], () => persistState());

  function addFavorite(dirPath: string): DirectoryEntry {
    const normalized = normalizePathForComparison(dirPath);
    const existing = favoriteDirs.value.find((d) => normalizePathForComparison(d.dirPath) === normalized);
    if (existing) return existing;
    const entry: DirectoryEntry = {
      dirPath,
      dirName: extractDirName(dirPath),
      lastAccessed: Date.now(),
    };
    favoriteDirs.value.push(entry);
    return entry;
  }

  function removeFavorite(dirPath: string) {
    const normalized = normalizePathForComparison(dirPath);
    favoriteDirs.value = favoriteDirs.value.filter((d) => normalizePathForComparison(d.dirPath) !== normalized);
  }

  function addRecent(dirPath: string) {
    const normalized = normalizePathForComparison(dirPath);
    const existingIdx = recentDirs.value.findIndex((d) => normalizePathForComparison(d.dirPath) === normalized);
    if (existingIdx >= 0) {
      const existing = recentDirs.value[existingIdx];
      existing.lastAccessed = Date.now();
      recentDirs.value = [existing, ...recentDirs.value.filter((d) => normalizePathForComparison(d.dirPath) !== normalized)];
      return;
    }
    const entry: DirectoryEntry = {
      dirPath,
      dirName: extractDirName(dirPath),
      lastAccessed: Date.now(),
    };
    recentDirs.value.unshift(entry);
    if (recentDirs.value.length > MAX_RECENT_DIRS) {
      recentDirs.value = recentDirs.value.slice(0, MAX_RECENT_DIRS);
    }
  }

  function removeRecent(dirPath: string) {
    const normalized = normalizePathForComparison(dirPath);
    recentDirs.value = recentDirs.value.filter((d) => normalizePathForComparison(d.dirPath) !== normalized);
  }

  function trackFileOpen(filePath: string) {
    const parentDir = extractParentDir(filePath);
    if (parentDir) addRecent(parentDir);
  }

  function touchFavorite(dirPath: string) {
    const normalized = normalizePathForComparison(dirPath);
    const entry = favoriteDirs.value.find((d) => normalizePathForComparison(d.dirPath) === normalized);
    if (!entry) return;
    entry.lastAccessed = Date.now();
    // Fire-and-forget; sort is a derived view, so the in-memory update is enough for the next render.
    void persistState();
  }

  function getNode(dirPath: string): DirectoryNode | undefined {
    return expandedNodes.value.get(dirPath);
  }

  function setNode(dirPath: string, node: DirectoryNode) {
    expandedNodes.value.set(dirPath, node);
  }

  function setNodeError(dirPath: string, error: "broken" | "unreadable") {
    const node = expandedNodes.value.get(dirPath);
    if (node) node.error = error;
  }

  function clearNodeError(dirPath: string) {
    const node = expandedNodes.value.get(dirPath);
    if (node) node.error = undefined;
  }

  function toggleNode(dirPath: string) {
    const node = expandedNodes.value.get(dirPath);
    if (node) {
      node.expanded = !node.expanded;
    }
  }

  async function persistState() {
    const configStore = useAppConfigStore();
    configStore.config.favoriteDirs = [...favoriteDirs.value];
    configStore.config.recentDirs = [...recentDirs.value];
    configStore.config.dirSortField = sortField.value;
    configStore.config.dirSortOrder = sortOrder.value;
    await configStore.persist();
  }

  function loadFromConfig(favDirs: DirectoryEntry[], recDirs: DirectoryEntry[], sf?: SortField, so?: SortOrder) {
    favoriteDirs.value = favDirs;
    recentDirs.value = recDirs;
    if (sf) sortField.value = sf;
    if (so) sortOrder.value = so;
  }

  return {
    favoriteDirs,
    recentDirs,
    expandedNodes,
    sortField,
    sortOrder,
    addFavorite,
    removeFavorite,
    addRecent,
    removeRecent,
    trackFileOpen,
    touchFavorite,
    getNode,
    setNode,
    setNodeError,
    clearNodeError,
    toggleNode,
    persistState,
    loadFromConfig,
  };
});
