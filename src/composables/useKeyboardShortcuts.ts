import { onMounted, onBeforeUnmount } from "vue";
import { useTabStore } from "../stores/tabStore";
import { useEditorStore } from "../stores/editorStore";
import { readFileContent, writeFileContent } from "../services/fileIoService";
import { openFileFromDialog } from "./useFileDialog";
import { useAppConfigStore } from "../stores/appConfigStore";
import { usePrint } from "./usePrint";

export function useKeyboardShortcuts() {
  const tabStore = useTabStore();
  const editorStore = useEditorStore();
  const configStore = useAppConfigStore();
  const { printTab } = usePrint();

  async function handleKeyDown(e: KeyboardEvent) {
    const ctrl = e.ctrlKey || e.metaKey;

    // Ctrl+O: Open file
    if (ctrl && e.key === "o") {
      e.preventDefault();
      await openFileFromDialog();
      return;
    }

    // Ctrl+S: Save current file
    if (ctrl && e.key === "s") {
      e.preventDefault();
      const tab = tabStore.activeTab;
      if (tab && tab.isDirty) {
        try {
          await writeFileContent(tab.filePath, tab.content);
          tabStore.markTabSaved(tab.id);
        } catch (err) {
          console.error("Failed to save file:", err);
          window.alert(`Failed to save ${tab.fileName}:\n${err}`);
        }
      }
      return;
    }

    // Ctrl+W: Close current tab
    if (ctrl && e.key === "w") {
      e.preventDefault();
      if (tabStore.activeTabId) {
        tabStore.requestCloseTab(tabStore.activeTabId);
      }
      return;
    }

    // Ctrl+Shift+R: Reload active file from disk
    if (ctrl && e.shiftKey && e.key === "R") {
      e.preventDefault();
      const tab = tabStore.activeTab;
      if (tab && (tab.externallyChanged || tab.externallyDeleted)) {
        try {
          const content = await readFileContent(tab.filePath);
          tabStore.reloadTabFromDisk(tab.id, content);
        } catch (err) {
          console.error("Failed to reload file:", err);
        }
      }
      return;
    }

    // Ctrl+P: Print current document
    if (ctrl && !e.shiftKey && e.key === "p") {
      e.preventDefault();
      await printTab(tabStore.activeTab, {
        fontSize: configStore.config.preferences.fontSize ?? 14,
      });
      return;
    }

    // Ctrl+Shift+P: Toggle preview/edit mode
    if (ctrl && e.shiftKey && e.key === "P") {
      e.preventDefault();
      editorStore.toggleMode();
      return;
    }

    // Ctrl+Shift+O: Toggle TOC panel
    if (ctrl && e.shiftKey && e.key === "O") {
      e.preventDefault();
      editorStore.toggleToc();
      return;
    }

    // Ctrl+Tab: Next tab
    if (ctrl && e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const tabs = tabStore.tabs;
      const idx = tabs.findIndex((t) => t.id === tabStore.activeTabId);
      if (idx >= 0 && tabs.length > 1) {
        const nextIdx = (idx + 1) % tabs.length;
        tabStore.setActiveTab(tabs[nextIdx].id);
      }
      return;
    }

    // Ctrl+Shift+Tab: Previous tab
    if (ctrl && e.shiftKey && e.key === "Tab") {
      e.preventDefault();
      const tabs = tabStore.tabs;
      const idx = tabs.findIndex((t) => t.id === tabStore.activeTabId);
      if (idx >= 0 && tabs.length > 1) {
        const prevIdx = (idx - 1 + tabs.length) % tabs.length;
        tabStore.setActiveTab(tabs[prevIdx].id);
      }
      return;
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
}
