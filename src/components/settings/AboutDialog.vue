<script setup lang="ts">
import { ref } from "vue";
import { open } from "@tauri-apps/plugin-shell";
import { useUpdateChecker } from "../../composables/useUpdateChecker";
import UpdateDialog from "./UpdateDialog.vue";

const GITHUB_REPO = "zhanghc1122/MarkTab";

const features = [
  { color: '#f59e0b', label: 'Native Performance — Tauri + Vue 3' },
  { color: '#3b82f6', label: 'Multi-tab Editing — Manage multiple files efficiently' },
  { color: '#10b981', label: 'Live Preview — What you see is what you get' },
]

const emit = defineEmits<{
  close: [];
}>();

const { updateInfo, checking, checkForUpdate, openReleasePage } = useUpdateChecker();
const showUpdateDialog = ref(false);
const appVersion = __APP_VERSION__;

async function handleCheckUpdate() {
  const result = await checkForUpdate(false);
  if (result) {
    showUpdateDialog.value = true;
  }
}
</script>

<template>
  <div class="about-overlay" @click.self="emit('close')">
    <div class="about-dialog">
      <div class="about-header">
        <h2>About MarkTab</h2>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>

      <div class="about-body">
        <div class="app-info">
          <div class="app-icon">M</div>
          <h3>MarkTab</h3>
          <p class="version">Version {{ appVersion }}</p>
          <p class="desc">A clean and efficient Markdown editor, built with Tauri for native performance and smooth experience.</p>
          <a class="repo-link" href="#" @click.prevent="open(`https://github.com/${GITHUB_REPO}`)">
            github.com/{{ GITHUB_REPO }}
          </a>
        </div>

        <div class="features">
          <div v-for="f in features" :key="f.color" class="feature-item">
            <span class="feature-dot" :style="{ background: f.color }"></span>
            <span>{{ f.label }}</span>
          </div>
        </div>
      </div>

      <div class="about-footer">
        <button class="btn btn-check-update" :disabled="checking" @click="handleCheckUpdate">
          {{ checking ? 'Checking...' : 'Check for Updates' }}
        </button>
        <button class="btn btn-close" @click="emit('close')">Close</button>
      </div>
    </div>
  </div>
  <UpdateDialog
    v-if="showUpdateDialog && updateInfo"
    :info="updateInfo"
    @close="showUpdateDialog = false"
    @download="openReleasePage"
  />
</template>

<style scoped>
.about-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.about-dialog {
  background: #fff;
  border-radius: 12px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.about-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.about-header h2 {
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

.about-body {
  padding: 24px 20px;
}

.app-info {
  text-align: center;
  margin-bottom: 20px;
}

.app-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 8px;
  border-radius: 14px;
  background: #7c3aed;
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-info h3 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: #7c3aed;
}

.version {
  margin: 0 0 8px;
  font-size: 12px;
  color: #9ca3af;
}

.desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.repo-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: #7c3aed;
  text-decoration: none;
}

.repo-link:hover {
  text-decoration: underline;
}

.features {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
  padding: 4px 0;
}

.feature-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.about-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-close {
  padding: 6px 24px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: #f3f4f6;
  color: #4b5563;
  border: none;
}

.btn-close:hover {
  background: #e5e7eb;
}

.btn-check-update {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: #7c3aed;
  color: #fff;
  border: none;
}

.btn-check-update:hover:not(:disabled) {
  background: #6d28d9;
}

.btn-check-update:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
