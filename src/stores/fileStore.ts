import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { FileEntry } from "../types/file";
import { generateId, extractFileName } from "../utils/pathUtils";
import { useAppConfigStore } from "./appConfigStore";
import { fileExists, statFile } from "../services/fileIoService";

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
    configStore.config.recentFiles = files.value.map(
      ({ id, filePath, fileName, lastOpened }) => ({
        id,
        filePath,
        fileName,
        lastOpened,
      })
    );
    await configStore.persist();
  }

  function loadFromConfig(recentFiles: FileEntry[]) {
    files.value = recentFiles.map((f) => ({
      ...f,
      fileStatus: undefined,
      diskMtime: undefined,
    }));
  }

  async function checkFileStatuses() {
    for (const file of files.value) {
      const existsOnDisk = await fileExists(file.filePath).catch(() => false);
      if (!existsOnDisk) {
        file.fileStatus = "deleted";
      } else {
        try {
          const info = await statFile(file.filePath);
          const mtime = info.mtime;
          if (file.diskMtime != null && mtime != null && mtime.getTime() > file.diskMtime.getTime()) {
            file.fileStatus = "modified";
          } else {
            file.fileStatus = undefined;
          }
          file.diskMtime = mtime;
        } catch {
          file.fileStatus = undefined;
          file.diskMtime = undefined;
        }
      }
    }
  }

  async function checkFileStatus(id: string) {
    const file = files.value.find((f) => f.id === id);
    if (!file) return;
    const existsOnDisk = await fileExists(file.filePath).catch(() => false);
    if (!existsOnDisk) {
      file.fileStatus = "deleted";
    } else {
      try {
        const info = await statFile(file.filePath);
        const mtime = info.mtime;
        if (file.diskMtime != null && mtime != null && mtime.getTime() > file.diskMtime.getTime()) {
          file.fileStatus = "modified";
        } else {
          file.fileStatus = undefined;
        }
        file.diskMtime = mtime;
      } catch {
        file.fileStatus = undefined;
        file.diskMtime = undefined;
      }
    }
  }

  return {
    files,
    sortedFiles,
    addFile,
    removeFile,
    persistState,
    loadFromConfig,
    checkFileStatuses,
    checkFileStatus,
  };
});
