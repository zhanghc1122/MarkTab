<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import Sidebar from "./Sidebar.vue";
import MainPanel from "./MainPanel.vue";
import { useAppConfigStore } from "../../stores/appConfigStore";
import { useFileStore } from "../../stores/fileStore";
import { useTabStore } from "../../stores/tabStore";
import { useEditorStore } from "../../stores/editorStore";
import { useAutoSave } from "../../composables/useAutoSave";
import { useKeyboardShortcuts } from "../../composables/useKeyboardShortcuts";
import { useExternalFileOpen } from "../../composables/useExternalFileOpen";

const configStore = useAppConfigStore();
const fileStore = useFileStore();
const tabStore = useTabStore();
const editorStore = useEditorStore();

const activeTab = computed(() => tabStore.activeTab);

useAutoSave(activeTab);
useKeyboardShortcuts();
useExternalFileOpen();

const isResizing = ref(false);

function startResize(e: MouseEvent) {
  e.preventDefault();
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = configStore.config.preferences.sidebarWidth ?? 260;

  function onMouseMove(e: MouseEvent) {
    const delta = e.clientX - startX;
    const newWidth = Math.min(400, Math.max(200, startWidth + delta));
    configStore.config.preferences.sidebarWidth = newWidth;
  }

  async function onMouseUp() {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    isResizing.value = false;
    configStore.setSidebarWidth(configStore.config.preferences.sidebarWidth);
    await configStore.persist();
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

onMounted(async () => {
  await configStore.init();
  fileStore.loadFromConfig(
    configStore.config.recentFiles,
    configStore.config.groups
  );
  editorStore.setMode(configStore.config.preferences.editorMode);
});
</script>

<template>
  <div class="app-layout" :class="{ 'is-resizing': isResizing }">
    <Sidebar />
    <div class="resize-handle" @mousedown="startResize"></div>
    <MainPanel />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
  color: #1f2937;
}

.app-layout.is-resizing {
  cursor: col-resize;
  user-select: none;
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  flex-shrink: 0;
  transition: background 0.15s;
}

.resize-handle:hover {
  background: #c084fc;
}
</style>
