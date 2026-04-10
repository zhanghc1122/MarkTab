<script setup lang="ts">
import { computed } from "vue";
import SidebarToolbar from "../sidebar/SidebarToolbar.vue";
import FileTree from "../sidebar/FileTree.vue";
import { useAppConfigStore } from "../../stores/appConfigStore";

const configStore = useAppConfigStore();
const sidebarWidth = computed(() => configStore.config.preferences.sidebarWidth ?? 260);
</script>

<template>
  <aside class="sidebar" :style="{ width: sidebarWidth + 'px' }">
    <div class="sidebar-header">
      <span class="app-title">MarkTab</span>
    </div>
    <SidebarToolbar />
    <div class="sidebar-content">
      <FileTree />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  min-width: 200px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
  background: #f5f5f5;
  user-select: none;
}

.sidebar-header {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #7c3aed;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}
</style>
