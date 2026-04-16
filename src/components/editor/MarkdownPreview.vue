<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { renderMarkdown, renderMermaidBlocks } from "../../services/markdownService";
import { open } from "@tauri-apps/plugin-shell";

const props = defineProps<{
  source: string;
  filePath?: string;
}>();

const previewRef = ref<HTMLElement>();
const renderedHtml = ref("");

watch(
  () => props.source,
  () => {
    renderedHtml.value = renderMarkdown(props.source, props.filePath);
    nextTick(() => {
      if (previewRef.value) {
        renderMermaidBlocks(previewRef.value);
      }
    });
  },
  { immediate: true },
);

function handleClick(e: MouseEvent) {
  const target = (e.target as Element).closest("a");
  if (!target) return;
  const href = target.getAttribute("href");
  if (!href || !href.match(/^https?:\/\//i)) return;
  e.preventDefault();
  open(href);
}
</script>

<template>
  <div class="markdown-preview-wrapper">
    <div class="markdown-preview" ref="previewRef" v-html="renderedHtml" @click="handleClick"></div>
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
