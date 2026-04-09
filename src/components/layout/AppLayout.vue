<script setup lang="ts">
import { onMounted, computed } from "vue";
import Sidebar from "./Sidebar.vue";
import MainPanel from "./MainPanel.vue";
import { useAppConfigStore } from "../../stores/appConfigStore";
import { useFileStore } from "../../stores/fileStore";
import { useTabStore } from "../../stores/tabStore";
import { useAutoSave } from "../../composables/useAutoSave";
import { useKeyboardShortcuts } from "../../composables/useKeyboardShortcuts";

const configStore = useAppConfigStore();
const fileStore = useFileStore();
const tabStore = useTabStore();

const activeTab = computed(() => tabStore.activeTab);

useAutoSave(activeTab);
useKeyboardShortcuts();

onMounted(async () => {
  await configStore.init();
  fileStore.loadFromConfig(
    configStore.config.recentFiles,
    configStore.config.groups
  );
});
</script>

<template>
  <div class="app-layout">
    <Sidebar />
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
</style>
