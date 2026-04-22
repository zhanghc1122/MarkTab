<script setup lang="ts">
import type { SortField, SortOrder } from "../../types/directory";

const props = defineProps<{
  field: SortField;
  order: SortOrder;
}>();

const emit = defineEmits<{
  "update:field": [value: SortField];
  "update:order": [value: SortOrder];
}>();

function toggleField(field: SortField) {
  if (props.field === field) {
    emit("update:order", props.order === "asc" ? "desc" : "asc");
  } else {
    emit("update:field", field);
    emit("update:order", field === "name" ? "asc" : "desc");
  }
}

const nameTitle = () =>
  props.field === "name"
    ? props.order === "asc" ? "Sort by name (A→Z), click to reverse" : "Sort by name (Z→A), click to reverse"
    : "Sort by name";

const timeTitle = () =>
  props.field === "time"
    ? props.order === "asc" ? "Sort by time (old→new), click to reverse" : "Sort by time (new→old), click to reverse"
    : "Sort by time";
</script>

<template>
  <div class="sort-bar">
    <button
      class="sort-btn"
      :class="{ active: field === 'name' }"
      @click="toggleField('name')"
      :title="nameTitle()"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5z"/>
      </svg>
      <svg v-if="field === 'name'" width="10" height="10" viewBox="0 0 16 16" fill="currentColor" class="sort-arrow">
        <path v-if="order === 'asc'" d="M8 15a.5.5 0 0 0 .5-.5V4.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 4.707V14.5a.5.5 0 0 0 .5.5z"/>
        <path v-if="order === 'desc'" d="M8 1a.5.5 0 0 0-.5.5v9.793L5.354 9.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 11.293V1.5A.5.5 0 0 0 8 1z"/>
      </svg>
    </button>
    <button
      class="sort-btn"
      :class="{ active: field === 'time' }"
      @click="toggleField('time')"
      :title="timeTitle()"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
      </svg>
      <svg v-if="field === 'time'" width="10" height="10" viewBox="0 0 16 16" fill="currentColor" class="sort-arrow">
        <path v-if="order === 'asc'" d="M8 15a.5.5 0 0 0 .5-.5V4.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 4.707V14.5a.5.5 0 0 0 .5.5z"/>
        <path v-if="order === 'desc'" d="M8 1a.5.5 0 0 0-.5.5v9.793L5.354 9.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 11.293V1.5A.5.5 0 0 0 8 1z"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.sort-bar {
  display: flex;
  gap: 1px;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.sort-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.sort-btn.active {
  color: #7c3aed;
  background: #ede9fe;
}

.sort-arrow {
  flex-shrink: 0;
}
</style>
