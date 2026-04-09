import { watch, type Ref } from "vue";
import type { TabState } from "../types/tab";
import { writeFileContent } from "../services/fileIoService";
import { useTabStore } from "../stores/tabStore";
import { useAppConfigStore } from "../stores/appConfigStore";

export function useAutoSave(activeTab: Ref<TabState | null>) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(
    () => activeTab.value?.content,
    () => {
      const tab = activeTab.value;
      if (!tab || !tab.isDirty) return;

      if (timer) clearTimeout(timer);

      const configStore = useAppConfigStore();
      const delay = configStore.config.preferences.autoSaveDelay || 2000;

      timer = setTimeout(async () => {
        if (!activeTab.value?.isDirty) return;
        try {
          await writeFileContent(activeTab.value.filePath, activeTab.value.content);
          const tabStore = useTabStore();
          if (activeTab.value.id) {
            tabStore.markTabSaved(activeTab.value.id);
          }
        } catch (e) {
          console.error("Auto-save failed:", e);
        }
      }, delay);
    }
  );
}
