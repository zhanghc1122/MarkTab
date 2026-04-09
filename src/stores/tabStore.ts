import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { TabState } from "../types/tab";
import type { FileEntry } from "../types/file";
import { generateId } from "../utils/pathUtils";

export const useTabStore = defineStore("tab", () => {
  const tabs = ref<TabState[]>([]);
  const activeTabId = ref<string | null>(null);

  const activeTab = computed(() =>
    tabs.value.find((t) => t.id === activeTabId.value) ?? null
  );

  function openTab(fileEntry: FileEntry, content: string): TabState {
    // Check if already open
    const existing = tabs.value.find((t) => t.filePath === fileEntry.filePath);
    if (existing) {
      activeTabId.value = existing.id;
      return existing;
    }
    const tab: TabState = {
      id: generateId(),
      filePath: fileEntry.filePath,
      fileName: fileEntry.fileName,
      content,
      originalContent: content,
      scrollTop: 0,
      cursorPos: 0,
      isDirty: false,
    };
    tabs.value.push(tab);
    activeTabId.value = tab.id;
    return tab;
  }

  function closeTab(id: string): TabState | null {
    const index = tabs.value.findIndex((t) => t.id === id);
    if (index === -1) return null;
    const closed = tabs.value[index];
    tabs.value.splice(index, 1);

    // If the closed tab was active, switch to another
    if (activeTabId.value === id) {
      if (tabs.value.length === 0) {
        activeTabId.value = null;
      } else {
        const newIndex = Math.min(index, tabs.value.length - 1);
        activeTabId.value = tabs.value[newIndex].id;
      }
    }
    return closed;
  }

  function setActiveTab(id: string) {
    const tab = tabs.value.find((t) => t.id === id);
    if (tab) {
      activeTabId.value = id;
    }
  }

  function updateTabContent(id: string, content: string) {
    const tab = tabs.value.find((t) => t.id === id);
    if (tab) {
      tab.content = content;
      tab.isDirty = content !== tab.originalContent;
    }
  }

  function markTabSaved(id: string) {
    const tab = tabs.value.find((t) => t.id === id);
    if (tab) {
      tab.originalContent = tab.content;
      tab.isDirty = false;
    }
  }

  function saveTabScrollState(id: string, scrollTop: number, cursorPos: number) {
    const tab = tabs.value.find((t) => t.id === id);
    if (tab) {
      tab.scrollTop = scrollTop;
      tab.cursorPos = cursorPos;
    }
  }

  function closeAllTabs() {
    tabs.value = [];
    activeTabId.value = null;
  }

  function closeOtherTabs(id: string) {
    tabs.value = tabs.value.filter((t) => t.id === id);
    activeTabId.value = id;
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    openTab,
    closeTab,
    setActiveTab,
    updateTabContent,
    markTabSaved,
    saveTabScrollState,
    closeAllTabs,
    closeOtherTabs,
  };
});
