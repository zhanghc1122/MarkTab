<script setup lang="ts">
import type { TabState } from "../../types/tab";

defineProps<{
  tab: TabState;
}>();

const emit = defineEmits<{
  reload: [];
  keepLocal: [];
  closeTab: [];
}>();
</script>

<template>
  <div
    class="file-change-banner"
    :class="{
      'banner-modified': tab.externallyChanged && !tab.externallyDeleted,
      'banner-deleted': tab.externallyDeleted,
    }"
  >
    <span class="banner-text">
      <template v-if="tab.externallyDeleted">
        文件已被删除
      </template>
      <template v-else-if="tab.isDirty">
        文件已被外部程序修改，本地有未保存的更改
      </template>
      <template v-else>
        文件已被外部程序修改
      </template>
    </span>
    <div class="banner-actions">
      <template v-if="tab.externallyDeleted">
        <button class="banner-btn btn-close" @click="emit('closeTab')">
          关闭标签
        </button>
        <button class="banner-btn btn-keep" @click="emit('keepLocal')">
          保留内容
        </button>
      </template>
      <template v-else>
        <button class="banner-btn btn-reload" @click="emit('reload')">
          重新加载
        </button>
        <button class="banner-btn btn-keep" @click="emit('keepLocal')">
          保留当前
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.file-change-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 32px;
  min-height: 32px;
  font-size: 12px;
  gap: 12px;
}

.banner-modified {
  background: #fef3c7;
  border-bottom: 1px solid #f59e0b;
  color: #92400e;
}

.banner-deleted {
  background: #fee2e2;
  border-bottom: 1px solid #ef4444;
  color: #991b1b;
}

.banner-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.banner-btn {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.15s;
}

.banner-modified .btn-reload {
  background: #f59e0b;
  border-color: #d97706;
  color: #fff;
}

.banner-modified .btn-reload:hover {
  background: #d97706;
}

.banner-deleted .btn-close {
  background: #ef4444;
  border-color: #dc2626;
  color: #fff;
}

.banner-deleted .btn-close:hover {
  background: #dc2626;
}

.btn-keep {
  background: transparent;
  border-color: currentColor;
  opacity: 0.7;
}

.btn-keep:hover {
  opacity: 1;
}
</style>
