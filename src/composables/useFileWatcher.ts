import { watch, onBeforeUnmount } from "vue";
import { watch as fsWatch } from "@tauri-apps/plugin-fs";
import { useTabStore } from "../stores/tabStore";
import {
  selfWriteTimestamps,
  readFileContent,
  fileExists,
} from "../services/fileIoService";

const SUPPRESSION_WINDOW_MS = 1000;

const activeWatchers = new Map<string, () => void>();

export function useFileWatcher() {
  const tabStore = useTabStore();

  function startWatching(filePath: string) {
    if (activeWatchers.has(filePath)) return;

    const stopPromise = fsWatch(
      filePath,
      () => {
        handleFileChange(filePath);
      },
      { delayMs: 500 }
    );

    activeWatchers.set(filePath, () => {
      stopPromise.then((unwatch) => unwatch());
    });
  }

  function stopWatching(filePath: string) {
    const stopFn = activeWatchers.get(filePath);
    if (stopFn) {
      stopFn();
      activeWatchers.delete(filePath);
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
          // Only mark as externally changed if the content actually differs
          try {
            const diskContent = await readFileContent(filePath);
            if (diskContent !== tab.content) {
              if (tab.isDirty) {
                tabStore.markTabExternallyChanged(tab.id);
              } else {
                tabStore.reloadTabFromDisk(tab.id, diskContent);
              }
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
          startWatching(path);
        }
      }

      for (const path of oldSet) {
        if (!currentSet.has(path)) {
          stopWatching(path);
        }
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    for (const [, stopFn] of activeWatchers) {
      stopFn();
    }
    activeWatchers.clear();
  });
}
