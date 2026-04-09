<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from "vue";
import { EditorView, placeholder, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorRef = ref<HTMLDivElement>();
let view: EditorView | null = null;
let ignoreNextUpdate = false;

function createState(content: string): EditorState {
  return EditorState.create({
    doc: content,
    extensions: [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      bracketMatching(),
      closeBrackets(),
      highlightSelectionMatches(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      markdown(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        indentWithTab,
      ]),
      EditorView.lineWrapping,
      placeholder("Start writing markdown..."),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !ignoreNextUpdate) {
          emit("update:modelValue", update.state.doc.toString());
        }
      }),
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "14px",
        },
        ".cm-scroller": {
          overflow: "auto",
          fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace',
        },
        ".cm-content": {
          padding: "16px 0",
        },
        ".cm-gutters": {
          background: "#f5f5f5",
          borderRight: "1px solid #e0e0e0",
        },
      }),
    ],
  });
}

onMounted(() => {
  if (editorRef.value) {
    view = new EditorView({
      state: createState(props.modelValue),
      parent: editorRef.value,
    });
  }
});

onBeforeUnmount(() => {
  view?.destroy();
});

// Watch for external content changes (tab switching)
watch(
  () => props.modelValue,
  (newVal) => {
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (newVal !== currentContent) {
      ignoreNextUpdate = true;
      view.setState(createState(newVal));
      ignoreNextUpdate = false;
    }
  }
);
</script>

<template>
  <div ref="editorRef" class="markdown-editor"></div>
</template>

<style scoped>
.markdown-editor {
  height: 100%;
  overflow: hidden;
}

.markdown-editor :deep(.cm-editor) {
  height: 100%;
  outline: none;
}

.markdown-editor :deep(.cm-focused) {
  outline: none;
}
</style>
