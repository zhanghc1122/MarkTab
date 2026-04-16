<script setup lang="ts">
const emit = defineEmits<{
  close: [];
}>();

function openDonation(url: string) {
  window.open(url, "_blank");
}
</script>

<template>
  <div class="about-overlay" @click.self="emit('close')">
    <div class="about-dialog">
      <div class="about-header">
        <h2>关于 MarkTab</h2>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>

      <div class="about-body">
        <div class="app-info">
          <div class="app-icon">📝</div>
          <h3>MarkTab</h3>
          <p class="version">版本 1.0.0</p>
          <p class="desc">一个简洁高效的 Markdown 编辑器，基于 Tauri 构建，原生性能，快速流畅。</p>
        </div>

        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">⚡</span>
            <span>原生性能 — Tauri + Vue 3</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📑</span>
            <span>多标签编辑 — 高效管理多文件</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎨</span>
            <span>实时预览 — 所见即所得</span>
          </div>
        </div>

        <div class="donation-section">
          <h4>支持开发</h4>
          <p class="donation-desc">如果 MarkTab 对你有帮助，欢迎发电支持！</p>

          <div class="donation-buttons">
            <button class="donation-btn afdian" @click="openDonation('https://afdian.net/')">
              <span class="donation-icon">⚡</span>
              <span>爱发电</span>
            </button>
            <button class="donation-btn paypal" @click="openDonation('https://www.paypal.me/')">
              <span class="donation-icon">🔵</span>
              <span>PayPal</span>
            </button>
          </div>

          <p class="donation-hint">点击按钮跳转至捐赠页面</p>
        </div>
      </div>

      <div class="about-footer">
        <button class="btn btn-close" @click="emit('close')">关闭</button>
      </div>
    </div>
  </div>
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
  font-size: 48px;
  margin-bottom: 8px;
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

.feature-icon {
  font-size: 14px;
}

.donation-section {
  text-align: center;
}

.donation-section h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.donation-desc {
  margin: 0 0 12px;
  font-size: 12px;
  color: #6b7280;
}

.donation-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.donation-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.donation-btn.afdian {
  background: #7c3aed;
  color: #fff;
}

.donation-btn.afdian:hover {
  background: #6d28d9;
}

.donation-btn.paypal {
  background: #0070ba;
  color: #fff;
}

.donation-btn.paypal:hover {
  background: #005ea6;
}

.donation-icon {
  font-size: 16px;
}

.donation-hint {
  margin: 8px 0 0;
  font-size: 11px;
  color: #9ca3af;
}

.about-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
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
</style>
