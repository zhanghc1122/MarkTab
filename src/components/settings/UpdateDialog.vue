<script setup lang="ts">
import type { UpdateInfo } from "../../composables/useUpdateChecker";

defineProps<{ info: UpdateInfo }>();
const emit = defineEmits<{
  close: [];
  download: [];
}>();
</script>

<template>
  <div class="update-overlay" @click.self="emit('close')">
    <div class="update-dialog">
      <div class="update-header">
        <h2 v-if="info.hasUpdate">Update Available</h2>
        <h2 v-else>Check for Updates</h2>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>

      <div class="update-body">
        <template v-if="info.hasUpdate">
          <p class="update-versions">
            <span class="version-old">v{{ info.currentVersion }}</span>
            <span class="arrow">&rarr;</span>
            <span class="version-new">v{{ info.latestVersion }}</span>
          </p>
          <div v-if="info.releaseNotes" class="release-notes">
            <pre>{{ info.releaseNotes }}</pre>
          </div>
          <p class="update-hint">Click Download to open the release page in your browser.</p>
        </template>
        <template v-else-if="info.releaseNotes">
          <p class="error-msg">{{ info.releaseNotes }}</p>
        </template>
        <template v-else>
          <p class="up-to-date">
            You're using the latest version (v{{ info.currentVersion }}).
          </p>
        </template>
      </div>

      <div class="update-footer">
        <button class="btn btn-later" @click="emit('close')">
          {{ info.hasUpdate ? 'Later' : 'Close' }}
        </button>
        <button v-if="info.hasUpdate" class="btn btn-download" @click="emit('download')">
          Download
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.update-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.update-dialog {
  background: #fff;
  border-radius: 12px;
  width: 380px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.update-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.update-header h2 {
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

.update-body {
  padding: 20px;
}

.update-versions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 16px;
}

.version-old {
  font-size: 14px;
  color: #9ca3af;
}

.arrow {
  color: #d1d5db;
}

.version-new {
  font-size: 16px;
  font-weight: 600;
  color: #7c3aed;
}

.release-notes {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.release-notes pre {
  margin: 0;
  font-size: 12px;
  color: #4b5563;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}

.update-hint {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.up-to-date {
  margin: 0;
  font-size: 14px;
  color: #059669;
  text-align: center;
}

.error-msg {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
  text-align: center;
}

.update-footer {
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
  border: none;
}

.btn-later {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-later:hover {
  background: #e5e7eb;
}

.btn-download {
  background: #7c3aed;
  color: #fff;
}

.btn-download:hover {
  background: #6d28d9;
}
</style>
