<script setup lang="ts">
import SkillFileNode from "./SkillFileNode.vue";
import type { SkillDir } from "../../types/skill";

defineProps<{
  skill: SkillDir;
}>();

const emit = defineEmits<{
  toggle: [dirPath: string];
}>();
</script>

<template>
  <div class="skill-dir-node">
    <div class="dir-header" @click="emit('toggle', skill.dirPath)">
      <span class="chevron" :class="{ expanded: skill.expanded }">▶</span>
      <span class="dir-icon"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M.5 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5zM2 5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 2 5zm1 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 3 7zm1 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6A.5.5 0 0 1 4 9zm.5 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6z"/></svg></span>
      <span class="dir-name">{{ skill.name }}</span>
    </div>
    <div v-if="skill.expanded" class="dir-children">
      <div v-if="skill.description" class="dir-description">
        {{ skill.description }}
      </div>
      <SkillFileNode
        name="SKILL.md"
        :file-path="skill.skillMdPath"
      />
      <SkillFileNode
        v-for="child in skill.children"
        :key="child.filePath"
        :name="child.relativePath"
        :file-path="child.filePath"
      />
    </div>
  </div>
</template>

<style scoped>
.skill-dir-node {
  user-select: none;
}

.dir-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  transition: background-color 0.15s;
}

.dir-header:hover {
  background-color: #e0e0e0;
}

.chevron {
  font-size: 9px;
  transition: transform 0.15s;
  flex-shrink: 0;
  opacity: 0.5;
}

.chevron.expanded {
  transform: rotate(90deg);
}

.dir-icon {
  flex-shrink: 0;
  color: #6b7280;
}

.dir-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dir-children {
  padding-left: 4px;
}

.dir-description {
  padding: 2px 8px 6px 36px;
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.4;
}
</style>
