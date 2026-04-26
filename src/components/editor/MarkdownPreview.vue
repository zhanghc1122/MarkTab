<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { renderMarkdown, renderMermaidBlocks, renderDrawioBlocks } from "../../services/markdownService";
import { open } from "@tauri-apps/plugin-shell";

const props = defineProps<{
  source: string;
  filePath?: string;
  fontSize?: number;
}>();

const previewRef = ref<HTMLElement>();
const renderedHtml = ref("");

// Diagram modal state
const showDiagramModal = ref(false);
const modalSvgContent = ref("");
const modalScale = ref(1);
const modalTranslateX = ref(0);
const modalTranslateY = ref(0);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

watch(
  () => props.source,
  () => {
    renderedHtml.value = renderMarkdown(props.source, props.filePath);
    nextTick(async () => {
      if (previewRef.value) {
        await renderMermaidBlocks(previewRef.value);
        await renderDrawioBlocks(previewRef.value);
      }
    });
  },
  { immediate: true },
);

function handleClick(e: MouseEvent) {
  // Check if click is on a diagram
  const diagram = (e.target as Element).closest(".mermaid-diagram, .drawio-diagram");
  if (diagram) {
    e.preventDefault();
    modalSvgContent.value = diagram.innerHTML;
    modalScale.value = 1;
    showDiagramModal.value = true;
    return;
  }

  // Existing link handling
  const target = (e.target as Element).closest("a");
  if (!target) return;
  const href = target.getAttribute("href");
  if (!href || !href.match(/^https?:\/\//i)) return;
  e.preventDefault();
  open(href);
}

function closeDiagramModal() {
  showDiagramModal.value = false;
  modalSvgContent.value = "";
  modalScale.value = 1;
  modalTranslateX.value = 0;
  modalTranslateY.value = 0;
}

function handleWheel(e: WheelEvent) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.15 : 0.15;
  modalScale.value = Math.min(5, Math.max(0.3, modalScale.value + delta));
}

function handleDragStart(e: MouseEvent) {
  isDragging.value = true;
  dragStart.value = { x: e.clientX - modalTranslateX.value, y: e.clientY - modalTranslateY.value };
}

function handleDragMove(e: MouseEvent) {
  if (!isDragging.value) return;
  modalTranslateX.value = e.clientX - dragStart.value.x;
  modalTranslateY.value = e.clientY - dragStart.value.y;
}

function handleDragEnd() {
  isDragging.value = false;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && showDiagramModal.value) {
    closeDiagramModal();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

defineExpose({
  getScrollContainer: () => previewRef.value?.parentElement ?? undefined,
});
</script>

<template>
  <div class="markdown-preview-wrapper">
    <div class="markdown-preview" ref="previewRef" v-html="renderedHtml" @click="handleClick" :style="{ fontSize: (props.fontSize ?? 14) + 'px' }"></div>
  </div>
  <Teleport to="body">
    <div v-if="showDiagramModal" class="diagram-modal-overlay" @click="closeDiagramModal">
      <div class="diagram-modal-content" @click.stop @wheel.prevent="handleWheel"
           @mousedown="handleDragStart" @mousemove="handleDragMove" @mouseup="handleDragEnd" @mouseleave="handleDragEnd">
        <button class="diagram-modal-close" @click="closeDiagramModal">&times;</button>
        <div class="diagram-modal-body" v-html="modalSvgContent"
             :style="{ transform: `translate(${modalTranslateX}px, ${modalTranslateY}px) scale(${modalScale})`, cursor: isDragging ? 'grabbing' : 'grab' }"></div>
      </div>
    </div>
  </Teleport>
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
