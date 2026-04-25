<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import Sidebar from "./Sidebar.vue";
import MainPanel from "./MainPanel.vue";
import { useAppConfigStore } from "../../stores/appConfigStore";
import { useFileStore } from "../../stores/fileStore";
import { useTabStore } from "../../stores/tabStore";
import { useEditorStore } from "../../stores/editorStore";
import { useDirectoryStore } from "../../stores/directoryStore";
import { useAutoSave } from "../../composables/useAutoSave";
import { useKeyboardShortcuts } from "../../composables/useKeyboardShortcuts";
import { useExternalFileOpen } from "../../composables/useExternalFileOpen";
import { useFileWatcher } from "../../composables/useFileWatcher";
import { useUpdateChecker } from "../../composables/useUpdateChecker";
import UpdateDialog from "../settings/UpdateDialog.vue";

const configStore = useAppConfigStore();
const fileStore = useFileStore();
const tabStore = useTabStore();
const editorStore = useEditorStore();
const dirStore = useDirectoryStore();

const activeTab = computed(() => tabStore.activeTab);

useAutoSave(activeTab);
useKeyboardShortcuts();
useExternalFileOpen();
useFileWatcher();

const isResizing = ref(false);
const showUpdateDialog = ref(false);

const { updateInfo, checkForUpdate, openReleasePage } = useUpdateChecker();

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
  fileStore.loadFromConfig(configStore.config.recentFiles);
  dirStore.loadFromConfig(
    configStore.config.favoriteDirs,
    configStore.config.recentDirs,
    configStore.config.dirSortField,
    configStore.config.dirSortOrder,
  );
  editorStore.setMode(configStore.config.preferences.editorMode);

  // Auto-check for updates on startup (silent)
  const result = await checkForUpdate(true);
  if (result?.hasUpdate) {
    showUpdateDialog.value = true;
  }
});
</script>

<template>
  <div class="app-layout" :class="{ 'is-resizing': isResizing }">
    <Sidebar />
    <div class="resize-handle" @mousedown="startResize"></div>
    <MainPanel />
    <UpdateDialog
      v-if="showUpdateDialog && updateInfo"
      :info="updateInfo"
      @close="showUpdateDialog = false"
      @download="openReleasePage"
    />
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
