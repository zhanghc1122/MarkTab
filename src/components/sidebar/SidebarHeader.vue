<script setup lang="ts">
import { ref } from "vue";
import type { SidebarView } from "../../types/config";
import SettingsDialog from "../settings/SettingsDialog.vue";
import AboutDialog from "../settings/AboutDialog.vue";

defineProps<{ view: SidebarView }>();
defineEmits<{ "update:view": [value: SidebarView] }>();

const showSettings = ref(false);
const showAbout = ref(false);

const tabs: { key: SidebarView; title: string; icon: string }[] = [
  { key: "files", title: "Files", icon: "files" },
  { key: "quickAccess", title: "Quick Access", icon: "folders" },
];
</script>

<template>
  <div class="sidebar-header">
    <span class="brand">MarkTab</span>
    <div class="header-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: view === tab.key }"
        :title="tab.title"
        @click="$emit('update:view', tab.key)"
      >
        <!-- Files: document list -->
        <svg v-if="tab.icon === 'files'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9zM2.5 3a.5.5 0 0 0-.5.5V6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5zM14 7H2v5.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V7z"/>
        </svg>
        <!-- Quick Access: folder -->
        <svg v-else-if="tab.icon === 'folders'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3H13.5a2 2 0 0 1 2 1.99V13a2 2 0 0 1-2 2H2.5a2 2 0 0 1-2-2V5.01a2 2 0 0 1 .04-.14ZM1 5v8a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 15 13V5a1.5 1.5 0 0 0-1.5-1.5H2.5A1.5 1.5 0 0 0 1 5z"/>
        </svg>
        </button>
    </div>
    <div class="header-actions">
      <button class="icon-btn" title="Settings" @click="showSettings = true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.186l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.186 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.186l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.186-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
        </svg>
      </button>
      <button class="icon-btn" title="About" @click="showAbout = true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zM8 3a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm0 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
      </button>
    </div>
  </div>
  <SettingsDialog v-if="showSettings" @close="showSettings = false" />
  <AboutDialog v-if="showAbout" @close="showAbout = false" />
</template>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-bottom: 1px solid #e0e0e0;
}

.brand {
  font-size: 12px;
  font-weight: 700;
  color: #7c3aed;
  letter-spacing: 0.3px;
  margin-right: 2px;
  flex-shrink: 0;
}

.header-tabs {
  flex: 1;
  display: flex;
  gap: 2px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: #e5e7eb;
  color: #6b7280;
}

.tab-btn.active {
  background: #ede9fe;
  color: #7c3aed;
}

.header-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.icon-btn:hover {
  background: #e0e0e0;
  color: #1f2937;
}
</style>
