<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTabStore } from "../../stores/tabStore";
import { useEditorStore } from "../../stores/editorStore";
import { useAppConfigStore } from "../../stores/appConfigStore";
import { readFileContent } from "../../services/fileIoService";
import { useTableOfContents } from "../../composables/useTableOfContents";
import MarkdownEditor from "./MarkdownEditor.vue";
import MarkdownPreview from "./MarkdownPreview.vue";
import TableOfContents from "./TableOfContents.vue";
import FileChangeBanner from "./FileChangeBanner.vue";
import SessionDetail from "./SessionDetail.vue";
import type { EditorView } from "@codemirror/view";

const tabStore = useTabStore();
const editorStore = useEditorStore();
const configStore = useAppConfigStore();

const prefs = computed(() => configStore.config.preferences);

const activeTab = computed(() => tabStore.activeTab);

const isSessionTab = computed(() => activeTab.value?.filePath.startsWith("session://") ?? false);

const hasExternalChange = computed(
  () =>
    activeTab.value?.externallyChanged || activeTab.value?.externallyDeleted
);

const isReloading = ref(false);

const editorComponentRef = ref<InstanceType<typeof MarkdownEditor> | null>(null);
const previewComponentRef = ref<InstanceType<typeof MarkdownPreview> | null>(null);

const activeContent = computed(() => activeTab.value?.content ?? "");
const { headings } = useTableOfContents(activeContent);

const editorView = computed<EditorView | null>(() => {
  return editorComponentRef.value?.getView?.() ?? null;
});

const previewScrollContainer = computed<HTMLElement | undefined>(() => {
  return previewComponentRef.value?.getScrollContainer?.();
});

// Save scroll/cursor state before switching tabs
watch(() => tabStore.activeTabId, (_newId, oldId) => {
  if (!oldId) return;
  const view = editorComponentRef.value?.getView?.();
  if (!view) return;
  const scrollTop = view.scrollDOM.scrollTop;
  const cursorPos = view.state.selection.main.head;
  tabStore.saveTabScrollState(oldId, scrollTop, cursorPos);
});

function handleContentChange(content: string) {
  if (tabStore.activeTabId) {
    tabStore.updateTabContent(tabStore.activeTabId, content);
  }
}

function handleToggleMode() {
  editorStore.toggleMode();
}

async function handleReload() {
  const tab = activeTab.value;
  if (!tab || isReloading.value) return;
  isReloading.value = true;
  try {
    const content = await readFileContent(tab.filePath);
    tabStore.reloadTabFromDisk(tab.id, content);
  } catch (err) {
    console.error("Failed to reload file:", err);
  } finally {
    setTimeout(() => {
      isReloading.value = false;
    }, 300);
  }
}

function handleKeepLocal() {
  const tab = activeTab.value;
  if (!tab) return;
  tabStore.clearExternalChangeState(tab.id);
}

function handleCloseTab() {
  const tab = activeTab.value;
  if (!tab) return;
  tabStore.closeTab(tab.id);
}
</script>

<template>
  <div class="editor-pane" v-if="activeTab">
    <!-- Session tab: show SessionDetail -->
    <template v-if="isSessionTab">
      <div class="editor-toolbar">
        <span class="file-path" :title="activeTab.filePath">{{ activeTab.fileName }}</span>
      </div>
      <SessionDetail :tab="activeTab" />
    </template>

    <!-- File tab: show editor/preview -->
    <template v-else>
    <div class="editor-toolbar">
      <span class="file-path" :title="activeTab.filePath">{{ activeTab.fileName }}</span>
      <div class="toolbar-right">
        <span v-if="activeTab.isDirty" class="dirty-indicator">Modified</span>
        <button
          class="reload-btn"
          @click="handleReload"
          :disabled="isReloading"
          title="Reload file (Ctrl+Shift+R)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
            :class="{ spin: isReloading }"
          >
            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
          Reload
        </button>
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
    <FileChangeBanner
      v-if="hasExternalChange"
      :tab="activeTab"
      @reload="handleReload"
      @keep-local="handleKeepLocal"
      @close-tab="handleCloseTab"
    />
    <div class="editor-content">
      <MarkdownEditor
        v-if="!editorStore.isPreviewMode"
        ref="editorComponentRef"
        :model-value="activeTab.content"
        :font-size="prefs.fontSize ?? 14"
        :line-wrapping="prefs.lineWrapping ?? true"
        :line-numbers="prefs.lineNumbers ?? true"
        :restore-scroll-top="activeTab.scrollTop"
        :restore-cursor-pos="activeTab.cursorPos"
        @update:model-value="handleContentChange"
      />
      <MarkdownPreview
        v-else
        ref="previewComponentRef"
        :source="activeTab.content"
        :file-path="activeTab.filePath"
      />
      <TableOfContents
        :headings="headings"
        :is-preview-mode="editorStore.isPreviewMode"
        :preview-scroll-container="previewScrollContainer"
        :editor-view="editorView"
      />
    </div>
    </template>
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

.reload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.reload-btn:hover {
  background: #fde68a;
}

.reload-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 0.3s ease-in-out;
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
  position: relative;
}
</style>
