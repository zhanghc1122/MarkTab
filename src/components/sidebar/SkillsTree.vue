<script setup lang="ts">
import { onMounted } from "vue";
import SkillDirNode from "./SkillDirNode.vue";
import { useSkills } from "../../composables/useSkills";

const { skills, loading, error, loadSkills, toggleExpand } = useSkills();

onMounted(() => {
  loadSkills();
});
</script>

<template>
  <div class="skills-tree">
    <div v-if="loading" class="skills-status">Loading skills...</div>
    <div v-else-if="error" class="skills-status skills-error">
      {{ error }}
    </div>
    <div v-else-if="skills.length === 0" class="skills-status">
      No skills found
    </div>
    <template v-else>
      <SkillDirNode
        v-for="skill in skills"
        :key="skill.dirPath"
        :skill="skill"
        @toggle="toggleExpand"
      />
    </template>
  </div>
</template>

<style scoped>
.skills-tree {
  padding: 4px 0;
}

.skills-status {
  padding: 12px 16px;
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}

.skills-error {
  color: #e53e3e;
}
</style>
