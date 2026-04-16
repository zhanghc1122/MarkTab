<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from "vue";
import { EditorView } from "@codemirror/view";
import type { TocItem } from "../../composables/useTableOfContents";
import { useEditorStore } from "../../stores/editorStore";

const props = defineProps<{
  headings: TocItem[];
  isPreviewMode: boolean;
  previewScrollContainer?: HTMLElement;
  editorView: EditorView | null;
}>();

const editorStore = useEditorStore();

const isOpen = ref(false);
const activeHeadingIndex = ref(-1);

// --- Scroll to heading ---

function scrollToHeading(item: TocItem) {
  if (props.isPreviewMode) {
    const container = props.previewScrollContainer;
    if (!container) return;
    const el = container.querySelector(`#${CSS.escape(item.id)}`) as HTMLElement | null;
    if (!el) return;
    const containerRect = container.getBoundingClientRect();
    const elementRect = el.getBoundingClientRect();
    const scrollTarget = elementRect.top - containerRect.top + container.scrollTop;
    container.scrollTo({ top: scrollTarget, behavior: "smooth" });
  } else if (props.editorView) {
    const line = props.editorView.state.doc.line(item.lineIndex + 1);
    props.editorView.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: "center" }),
    });
  }
}

// --- Preview scroll follow (IntersectionObserver) ---

let observer: IntersectionObserver | null = null;

function teardownObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function setupPreviewScrollFollow() {
  teardownObserver();
  const container = props.previewScrollContainer;
  if (!container || props.headings.length === 0) return;

  const headingEls = container.querySelectorAll<HTMLElement>(
    'h1[id^="toc-heading-"], h2[id^="toc-heading-"], h3[id^="toc-heading-"], h4[id^="toc-heading-"], h5[id^="toc-heading-"], h6[id^="toc-heading-"]'
  );
  if (headingEls.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const idx = parseInt(id.replace("toc-heading-", ""));
          activeHeadingIndex.value = idx;
          break;
        }
      }
    },
    { root: container, rootMargin: "0px 0px -70% 0px", threshold: 0 }
  );

  headingEls.forEach((el) => observer!.observe(el));
}

// --- Editor scroll follow ---

let scrollHandler: { el: HTMLElement; fn: () => void } | null = null;

function teardownEditorScrollFollow() {
  if (scrollHandler) {
    scrollHandler.el.removeEventListener("scroll", scrollHandler.fn);
    scrollHandler = null;
  }
}

function setupEditorScrollFollow() {
  teardownEditorScrollFollow();
  if (!props.editorView || props.headings.length === 0) return;

  const scroller = props.editorView.dom.querySelector<HTMLElement>(".cm-scroller");
  if (!scroller) return;

  const fn = () => {
    const scrollTop = scroller.scrollTop;
    const visibleTop = scrollTop + 100;
    let best = -1;
    for (const h of props.headings) {
      const line = props.editorView!.state.doc.line(h.lineIndex + 1);
      const top = props.editorView!.lineBlockAt(line.from).top;
      if (top <= visibleTop) {
        best = h.index;
      } else {
        break;
      }
    }
    activeHeadingIndex.value = best;
  };

  scroller.addEventListener("scroll", fn);
  scrollHandler = { el: scroller, fn };
}

// --- Reactivity ---

watch(
  () => props.headings,
  () => {
    nextTick(() => {
      if (props.isPreviewMode) {
        setupPreviewScrollFollow();
      } else {
        setupEditorScrollFollow();
      }
    });
  },
  { flush: "post" }
);

watch(
  () => props.isPreviewMode,
  (isPreview) => {
    activeHeadingIndex.value = -1;
    nextTick(() => {
      if (isPreview) {
        teardownEditorScrollFollow();
        setupPreviewScrollFollow();
      } else {
        teardownObserver();
        setupEditorScrollFollow();
      }
    });
  }
);

// Sync with editorStore.tocOpen
watch(
  () => editorStore.tocOpen,
  (val) => {
    isOpen.value = val;
  }
);

watch(isOpen, (val) => {
  editorStore.tocOpen = val;
  if (!val) {
    teardownObserver();
    teardownEditorScrollFollow();
  } else {
    nextTick(() => {
      if (props.isPreviewMode) {
        setupPreviewScrollFollow();
      } else {
        setupEditorScrollFollow();
      }
    });
  }
});

onBeforeUnmount(() => {
  teardownObserver();
  teardownEditorScrollFollow();
});

function togglePanel() {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <div class="toc-container">
    <button
      class="toc-toggle"
      @click="togglePanel"
      title="目录 (Ctrl+Shift+O)"
      :class="{ active: isOpen }"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 4a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1z"/>
      </svg>
    </button>
    <Transition name="toc-slide">
      <div v-if="isOpen" class="toc-panel">
        <div class="toc-header">目录</div>
        <div v-if="headings.length === 0" class="toc-empty">无标题</div>
        <div v-else class="toc-list">
          <button
            v-for="item in headings"
            :key="item.id"
            class="toc-item"
            :class="{ active: activeHeadingIndex === item.index }"
            :style="{ paddingLeft: `${12 + (item.level - 1) * 12}px` }"
            @click="scrollToHeading(item)"
            :title="item.text"
          >
            {{ item.text }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toc-container {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 50;
}

.toc-toggle {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  backdrop-filter: blur(4px);
}

.toc-toggle:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.toc-toggle.active {
  background: #eff6ff;
  color: #2563eb;
  border-color: #93c5fd;
}

.toc-panel {
  position: absolute;
  top: 36px;
  right: 0;
  width: 260px;
  max-height: 70vh;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(8px);
}

.toc-header {
  padding: 10px 14px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #f0f0f0;
  user-select: none;
}

.toc-empty {
  padding: 16px 14px;
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}

.toc-list {
  overflow-y: auto;
  padding: 6px 0;
}

.toc-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 5px 12px;
  border: none;
  background: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.1s;
}

.toc-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.toc-item.active {
  color: #2563eb;
  font-weight: 600;
  background: #eff6ff;
}

/* Slide transition */
.toc-slide-enter-active,
.toc-slide-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.toc-slide-enter-from,
.toc-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .toc-toggle {
    background: rgba(30, 30, 30, 0.9);
    border-color: #444;
    color: #9ca3af;
  }

  .toc-toggle:hover {
    background: #374151;
    color: #e5e7eb;
  }

  .toc-toggle.active {
    background: #1e3a5f;
    color: #60a5fa;
    border-color: #2563eb;
  }

  .toc-panel {
    background: rgba(30, 30, 30, 0.95);
    border-color: #444;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .toc-header {
    color: #e5e7eb;
    border-bottom-color: #444;
  }

  .toc-item {
    color: #9ca3af;
  }

  .toc-item:hover {
    background: #374151;
    color: #e5e7eb;
  }

  .toc-item.active {
    color: #60a5fa;
    background: #1e3a5f;
  }
}
</style>
