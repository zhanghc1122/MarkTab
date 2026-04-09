<script setup lang="ts">
import type { TabState } from "../../types/tab";

defineProps<{
  tab: TabState;
  active: boolean;
}>();

const emit = defineEmits<{
  select: [];
  close: [];
}>();
</script>

<template>
  <div
    class="tab-item"
    :class="{ active, dirty: tab.isDirty }"
    @click="emit('select')"
  >
    <span class="tab-title">{{ tab.fileName }}</span>
    <button class="tab-close" @click.stop="emit('close')" title="Close">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  height: 100%;
  min-width: 0;
  max-width: 180px;
  cursor: pointer;
  border-right: 1px solid #e0e0e0;
  background: #f5f5f5;
  transition: background 0.1s;
  position: relative;
}

.tab-item:hover {
  background: #ffffff;
}

.tab-item.active {
  background: #ffffff;
  border-bottom: 2px solid #7c3aed;
}

.tab-title {
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #6b7280;
}

.tab-item.active .tab-title {
  color: #1f2937;
}

.tab-item.dirty .tab-title::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d97706;
  margin-right: 4px;
  vertical-align: middle;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s;
}

.tab-item:hover .tab-close,
.tab-item.active .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: #d4d4d4;
  color: #ef4444;
}
</style>
