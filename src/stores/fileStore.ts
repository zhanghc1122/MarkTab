import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { FileEntry } from "../types/file";
import { generateId, extractFileName } from "../utils/pathUtils";
import { useAppConfigStore } from "./appConfigStore";

export const useFileStore = defineStore("file", () => {
  const files = ref<FileEntry[]>([]);

  const sortedFiles = computed(() =>
    [...files.value].sort((a, b) => b.lastOpened - a.lastOpened)
  );

  function addFile(filePath: string): FileEntry {
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
    };
    files.value.push(entry);
    return entry;
  }

  function removeFile(id: string) {
    files.value = files.value.filter((f) => f.id !== id);
  }

  async function persistState() {
    const configStore = useAppConfigStore();
    configStore.config.recentFiles = [...files.value];
    await configStore.persist();
  }

  function loadFromConfig(recentFiles: FileEntry[]) {
    files.value = recentFiles;
  }

  return {
    files,
    sortedFiles,
    addFile,
    removeFile,
    persistState,
    loadFromConfig,
  };
});
