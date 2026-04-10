<script setup lang="ts">
import { computed } from "vue";
import { useTabStore } from "../../stores/tabStore";
import { useEditorStore } from "../../stores/editorStore";
import { useAppConfigStore } from "../../stores/appConfigStore";
import MarkdownEditor from "./MarkdownEditor.vue";
import MarkdownPreview from "./MarkdownPreview.vue";

const tabStore = useTabStore();
const editorStore = useEditorStore();
const configStore = useAppConfigStore();

const prefs = computed(() => configStore.config.preferences);

const activeTab = computed(() => tabStore.activeTab);

function handleContentChange(content: string) {
  if (tabStore.activeTabId) {
    tabStore.updateTabContent(tabStore.activeTabId, content);
  }
}

function handleToggleMode() {
  editorStore.toggleMode();
}
</script>

<template>
  <div class="editor-pane" v-if="activeTab">
    <div class="editor-toolbar">
      <span class="file-path" :title="activeTab.filePath">{{ activeTab.fileName }}</span>
      <div class="toolbar-right">
        <span v-if="activeTab.isDirty" class="dirty-indicator">Modified</span>
        <button
          class="mode-toggle"
          @click="handleToggleMode"
          :title="editorStore.isPreviewMode ? 'Switch to Edit' : 'Switch to Preview'"
        >
          <svg v-if="editorStore.isPreviewMode" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-4.5 1.5a.5.5 0 0 1-.62-.62l1.5-4.5a.5.5 0 0 1 .11-.168l10-10z"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
          </svg>
          {{ editorStore.isPreviewMode ? 'Edit' : 'Preview' }}
        </button>
      </div>
    </div>
    <div class="editor-content">
      <MarkdownEditor
        v-if="!editorStore.isPreviewMode"
        :model-value="activeTab.content"
        :font-size="prefs.fontSize ?? 14"
        :line-wrapping="prefs.lineWrapping ?? true"
        :line-numbers="prefs.lineNumbers ?? true"
        @update:model-value="handleContentChange"
      />
      <MarkdownPreview
        v-else
        :source="activeTab.content"
        :file-path="activeTab.filePath"
      />
    </div>
  </div>
</template>

<style scoped>
.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px;
  height: 32px;
  min-height: 32px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.file-path {
  font-size: 12px;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dirty-indicator {
  font-size: 11px;
  color: #d97706;
}

.mode-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.mode-toggle:hover {
  background: #e0e0e0;
  color: #1f2937;
}

.editor-content {
  flex: 1;
  overflow: hidden;
}
</style>
