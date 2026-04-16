import { onMounted, onBeforeUnmount } from "vue";
import { useTabStore } from "../stores/tabStore";
import { useEditorStore } from "../stores/editorStore";
import { useFileStore } from "../stores/fileStore";
import { readFileContent, openFileDialog, writeFileContent } from "../services/fileIoService";

export function useKeyboardShortcuts() {
  const tabStore = useTabStore();
  const editorStore = useEditorStore();
  const fileStore = useFileStore();

  async function handleKeyDown(e: KeyboardEvent) {
    const ctrl = e.ctrlKey || e.metaKey;

    // Ctrl+O: Open file
    if (ctrl && e.key === "o") {
      e.preventDefault();
      const path = await openFileDialog();
      if (!path) return;
      try {
        const content = await readFileContent(path);
        const entry = fileStore.addFile(path);
        tabStore.openTab(entry, content);
        fileStore.persistState();
      } catch (err) {
        console.error("Failed to open file:", err);
      }
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
        }
      }
      return;
    }

    // Ctrl+W: Close current tab
    if (ctrl && e.key === "w") {
      e.preventDefault();
      if (tabStore.activeTabId) {
        tabStore.closeTab(tabStore.activeTabId);
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

    // Ctrl+P: Toggle preview/edit mode
    if (ctrl && e.key === "p") {
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
