import { watch, onBeforeUnmount } from "vue";
import { watch as fsWatch } from "@tauri-apps/plugin-fs";
import type { WatchEvent } from "@tauri-apps/plugin-fs";
import { useTabStore } from "../stores/tabStore";
import {
  selfWriteTimestamps,
  readFileContent,
  fileExists,
} from "../services/fileIoService";
import { extractParentDir } from "../utils/pathUtils";

const SUPPRESSION_WINDOW_MS = 1000;

const dirWatchers = new Map<string, () => void>();
const watchedFilesByDir = new Map<string, Set<string>>();

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").toLowerCase();
}

export function useFileWatcher() {
  const tabStore = useTabStore();

  function addFileToWatch(filePath: string) {
    const dirPath = extractParentDir(filePath);
    if (!dirPath) return;

    let filesSet = watchedFilesByDir.get(dirPath);
    if (!filesSet) {
      filesSet = new Set();
      watchedFilesByDir.set(dirPath, filesSet);
    }

    if (!filesSet.has(filePath)) {
      filesSet.add(filePath);
      startDirWatch(dirPath);
    }
  }

  function removeFileFromWatch(filePath: string) {
    const dirPath = extractParentDir(filePath);
    if (!dirPath) return;

    const filesSet = watchedFilesByDir.get(dirPath);
    if (filesSet) {
      filesSet.delete(filePath);
      if (filesSet.size === 0) {
        stopDirWatch(dirPath);
      }
    }
  }

  function startDirWatch(dirPath: string) {
    if (dirWatchers.has(dirPath)) return;

    const stopPromise = fsWatch(
      dirPath,
      (event: WatchEvent) => {
        handleDirEvent(dirPath, event);
      },
      { delayMs: 500 }
    );

    dirWatchers.set(dirPath, () => {
      stopPromise.then((unwatch) => unwatch());
    });
  }

  function stopDirWatch(dirPath: string) {
    const stopFn = dirWatchers.get(dirPath);
    if (stopFn) {
      stopFn();
      dirWatchers.delete(dirPath);
      watchedFilesByDir.delete(dirPath);
    }
  }

  function handleDirEvent(dirPath: string, event: WatchEvent) {
    const filesInDir = watchedFilesByDir.get(dirPath);
    if (!filesInDir) return;

    for (const eventPath of event.paths) {
      const normalizedEventPath = normalizePath(eventPath);
      for (const watchedFile of filesInDir) {
        if (normalizedEventPath === normalizePath(watchedFile)) {
          handleFileChange(watchedFile);
          break;
        }
      }
    }
  }

  async function handleFileChange(filePath: string) {
    const lastWrite = selfWriteTimestamps.get(filePath);
    if (lastWrite && Date.now() - lastWrite < SUPPRESSION_WINDOW_MS) {
      return;
    }

    const existsOnDisk = await fileExists(filePath).catch(() => false);

    for (const tab of tabStore.tabs) {
      if (tab.filePath === filePath) {
        if (!existsOnDisk) {
          tabStore.markTabExternallyDeleted(tab.id);
        } else {
          try {
            const diskContent = await readFileContent(filePath);
            if (diskContent !== tab.content) {
              tabStore.markTabExternallyChanged(tab.id);
            }
          } catch {
            tabStore.markTabExternallyDeleted(tab.id);
          }
        }
      }
    }
  }

  watch(
    () => tabStore.tabs.map((t) => t.filePath),
    (currentPaths, oldPaths) => {
      const currentSet = new Set(currentPaths);
      const oldSet = new Set(oldPaths ?? []);

      for (const path of currentSet) {
        if (!oldSet.has(path)) {
          addFileToWatch(path);
        }
      }

      for (const path of oldSet) {
        if (!currentSet.has(path)) {
          removeFileFromWatch(path);
        }
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    for (const [, stopFn] of dirWatchers) {
      stopFn();
    }
    dirWatchers.clear();
    watchedFilesByDir.clear();
  });
}
