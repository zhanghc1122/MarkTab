import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { FileEntry, FileGroup } from "../types/file";
import { generateId, extractFileName } from "../utils/pathUtils";
import { useAppConfigStore } from "./appConfigStore";

export const useFileStore = defineStore("file", () => {
  const files = ref<FileEntry[]>([]);
  const groups = ref<FileGroup[]>([]);

  const ungroupedFiles = computed(() =>
    files.value
      .filter((f) => f.groupId === null)
      .sort((a, b) => b.lastOpened - a.lastOpened)
  );

  function getGroupFiles(groupId: string): FileEntry[] {
    return files.value
      .filter((f) => f.groupId === groupId)
      .sort((a, b) => b.lastOpened - a.lastOpened);
  }

  function addFile(filePath: string, groupId: string | null = null): FileEntry {
    const existing = files.value.find((f) => f.filePath === filePath);
    if (existing) {
      existing.lastOpened = Date.now();
      return existing;
    }
    const entry: FileEntry = {
      id: generateId(),
      filePath,
      fileName: extractFileName(filePath),
      lastOpened: Date.now(),
      groupId,
    };
    files.value.push(entry);
    return entry;
  }

  function removeFile(id: string) {
    files.value = files.value.filter((f) => f.id !== id);
  }

  function assignGroup(fileId: string, groupId: string | null) {
    const file = files.value.find((f) => f.id === fileId);
    if (file) {
      file.groupId = groupId;
    }
  }

  function createGroup(name: string, color?: string): FileGroup {
    const group: FileGroup = {
      id: generateId(),
      name,
      color,
      collapsed: false,
      order: groups.value.length,
    };
    groups.value.push(group);
    return group;
  }

  function deleteGroup(id: string) {
    groups.value = groups.value.filter((g) => g.id !== id);
    // Move files in this group to ungrouped
    files.value.forEach((f) => {
      if (f.groupId === id) {
        f.groupId = null;
      }
    });
  }

  function renameGroup(id: string, name: string) {
    const group = groups.value.find((g) => g.id === id);
    if (group) {
      group.name = name;
    }
  }

  function toggleGroupCollapse(id: string) {
    const group = groups.value.find((g) => g.id === id);
    if (group) {
      group.collapsed = !group.collapsed;
    }
  }

  async function persistState() {
    const configStore = useAppConfigStore();
    configStore.config.recentFiles = [...files.value];
    configStore.config.groups = [...groups.value];
    await configStore.persist();
  }

  function loadFromConfig(recentFiles: FileEntry[], fileGroups: FileGroup[]) {
    files.value = recentFiles;
    groups.value = fileGroups;
  }

  return {
    files,
    groups,
    ungroupedFiles,
    getGroupFiles,
    addFile,
    removeFile,
    assignGroup,
    createGroup,
    deleteGroup,
    renameGroup,
    toggleGroupCollapse,
    persistState,
    loadFromConfig,
  };
});
