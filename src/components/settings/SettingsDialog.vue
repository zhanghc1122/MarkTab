<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useAppConfigStore } from "../../stores/appConfigStore";

const configStore = useAppConfigStore();

const autoSaveDelay = ref(configStore.config.preferences.autoSaveDelay);
const sidebarWidth = ref(configStore.config.preferences.sidebarWidth ?? 260);
const editorMode = ref(configStore.config.preferences.editorMode);
const fontSize = ref(configStore.config.preferences.fontSize ?? 14);
const lineWrapping = ref(configStore.config.preferences.lineWrapping ?? true);
const lineNumbers = ref(configStore.config.preferences.lineNumbers ?? true);

const emit = defineEmits<{
  close: [];
}>();

async function handleSave() {
  configStore.setAutoSaveDelay(autoSaveDelay.value);
  configStore.setSidebarWidth(sidebarWidth.value);
  configStore.setEditorMode(editorMode.value);
  configStore.setFontSize(fontSize.value);
  configStore.setLineWrapping(lineWrapping.value);
  configStore.setLineNumbers(lineNumbers.value);
  await configStore.persist();
  emit("close");
}

function handleCancel() {
  emit("close");
}

function handleSetDefault() {
  invoke("open_default_apps_settings");
}
</script>

<template>
  <div class="settings-overlay" @click.self="handleCancel">
    <div class="settings-dialog">
      <div class="settings-header">
        <h2>设置</h2>
        <button class="close-btn" @click="handleCancel">&times;</button>
      </div>

      <div class="settings-body">
        <div class="setting-item">
          <label class="setting-label">自动保存延迟</label>
          <div class="setting-control">
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              v-model.number="autoSaveDelay"
            />
            <span class="setting-value">{{ (autoSaveDelay / 1000).toFixed(1) }}s</span>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">侧边栏宽度</label>
          <div class="setting-control">
            <input
              type="range"
              min="200"
              max="400"
              step="10"
              v-model.number="sidebarWidth"
            />
            <span class="setting-value">{{ sidebarWidth }}px</span>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">编辑器字体大小</label>
          <div class="setting-control">
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              v-model.number="fontSize"
            />
            <span class="setting-value">{{ fontSize }}px</span>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">默认编辑器模式</label>
          <div class="setting-control">
            <select v-model="editorMode">
              <option value="edit">编辑模式</option>
              <option value="preview">预览模式</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">自动换行</label>
          <div class="setting-control">
            <input type="checkbox" v-model="lineWrapping" />
            <span class="setting-value">{{ lineWrapping ? '开启' : '关闭' }}</span>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">显示行号</label>
          <div class="setting-control">
            <input type="checkbox" v-model="lineNumbers" />
            <span class="setting-value">{{ lineNumbers ? '开启' : '关闭' }}</span>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">默认 Markdown 编辑器</label>
          <p class="setting-hint">将 MarkTab 设为 .md 文件的默认打开程序</p>
          <button class="btn btn-outline" @click="handleSetDefault">
            设为默认应用
          </button>
        </div>
      </div>

      <div class="settings-footer">
        <button class="btn btn-cancel" @click="handleCancel">取消</button>
        <button class="btn btn-save" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-dialog {
  background: #fff;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.settings-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.close-btn:hover {
  color: #374151;
}

.settings-body {
  padding: 20px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-control input[type="range"] {
  flex: 1;
  accent-color: #3b82f6;
}

.setting-control input[type="checkbox"] {
  accent-color: #3b82f6;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.setting-value {
  font-size: 13px;
  color: #6b7280;
  min-width: 36px;
  text-align: right;
}

.setting-control select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  background: #fff;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #d1d5db;
}

.btn-cancel {
  background: #fff;
  color: #374151;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-save {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.btn-save:hover {
  background: #2563eb;
}

.btn-outline {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: #fff;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-outline:hover {
  background: #eff6ff;
}

.setting-hint {
  margin: 0 0 8px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
