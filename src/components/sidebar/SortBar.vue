<script setup lang="ts">
import type { SortOrder } from "../../types/directory";

export interface SortFieldDef {
  key: string;
  title: string;
  defaultOrder: SortOrder;
}

const props = withDefaults(
  defineProps<{
    field: string;
    order: SortOrder;
    fields?: SortFieldDef[];
  }>(),
  {
    fields: () => [
      { key: "name", title: "Sort by name", defaultOrder: "asc" as SortOrder },
      { key: "time", title: "Sort by time", defaultOrder: "desc" as SortOrder },
    ],
  }
);

const emit = defineEmits<{
  "update:field": [value: string];
  "update:order": [value: SortOrder];
}>();

function toggleField(fieldKey: string) {
  const def = props.fields!.find((f) => f.key === fieldKey);
  if (props.field === fieldKey) {
    emit("update:order", props.order === "asc" ? "desc" : "asc");
  } else {
    emit("update:field", fieldKey);
    emit("update:order", def?.defaultOrder ?? "asc");
  }
}

function fieldTitle(def: SortFieldDef): string {
  if (props.field !== def.key) return def.title;
  const dir = props.order === "asc" ? "ascending" : "descending";
  return `${def.title} (${dir}), click to reverse`;
}
</script>

<template>
  <div class="sort-bar">
    <button
      v-for="def in fields"
      :key="def.key"
      class="sort-btn"
      :class="{ active: field === def.key }"
      @click="toggleField(def.key)"
      :title="fieldTitle(def)"
    >
      <slot :name="'icon-' + def.key" />
      <svg v-if="field === def.key" width="10" height="10" viewBox="0 0 16 16" fill="currentColor" class="sort-arrow">
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
