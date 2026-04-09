<script setup lang="ts">
import { computed } from "vue";
import { renderMarkdown } from "../../services/markdownService";

const props = defineProps<{
  source: string;
}>();

const renderedHtml = computed(() => renderMarkdown(props.source));
</script>

<template>
  <div class="markdown-preview-wrapper">
    <div class="markdown-preview" v-html="renderedHtml"></div>
  </div>
</template>

<style scoped>
.markdown-preview-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: 24px 32px;
  background: #ffffff;
}

.markdown-preview {
  max-width: 800px;
  margin: 0 auto;
}
</style>
