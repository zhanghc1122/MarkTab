<script setup lang="ts">
import SidebarToolbar from "../sidebar/SidebarToolbar.vue";
import FileTree from "../sidebar/FileTree.vue";
</script>

<template>
  <aside class="sidebar">
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
  width: 260px;
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
