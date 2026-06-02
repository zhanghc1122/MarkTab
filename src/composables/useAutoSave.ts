import { watch, type Ref } from "vue";
import type { TabState } from "../types/tab";
import { writeFileContent } from "../services/fileIoService";
import { useTabStore } from "../stores/tabStore";
import { useAppConfigStore } from "../stores/appConfigStore";

export function useAutoSave(activeTab: Ref<TabState | null>) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function saveTab(tab: TabState): Promise<string | null> {
    if (!tab.isDirty) return null;
    if (tab.externallyChanged || tab.externallyDeleted) return null;
    try {
      await writeFileContent(tab.filePath, tab.content);
      useTabStore().markTabSaved(tab.id);
      return null;
    } catch (e) {
      console.error("Auto-save failed:", e);
      return tab.fileName;
    }
  }

  async function flushAutoSave(): Promise<string[]> {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    const failed: string[] = [];
    for (const tab of useTabStore().tabs.slice()) {
      const result = await saveTab(tab);
      if (result) failed.push(result);
    }
    return failed;
  }

  watch(
    () => activeTab.value?.content,
    () => {
      const tab = activeTab.value;
      if (!tab || !tab.isDirty) return;

      if (timer) clearTimeout(timer);

      const delay = useAppConfigStore().config.preferences.autoSaveDelay || 2000;

      timer = setTimeout(() => {
        void saveTab(tab);
      }, delay);
    }
  );

  return { flushAutoSave, saveTab };
}
