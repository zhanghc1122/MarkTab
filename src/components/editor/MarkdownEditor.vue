<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { EditorView, placeholder, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { saveImageToAssets } from "../../services/fileIoService";

const props = withDefaults(defineProps<{
  modelValue: string;
  fontSize?: number;
  lineWrapping?: boolean;
  lineNumbers?: boolean;
  restoreScrollTop?: number;
  restoreCursorPos?: number;
  filePath?: string;
}>(), {
  fontSize: 14,
  lineWrapping: true,
  lineNumbers: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorRef = ref<HTMLDivElement>();
let view: EditorView | null = null;
let ignoreNextUpdate = false;

const themeCompartment = new Compartment();
const wrapCompartment = new Compartment();
const lineNumbersCompartment = new Compartment();

function createTheme(fontSize: number) {
  return EditorView.theme({
    "&": {
      height: "100%",
      fontSize: `${fontSize}px`,
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
  });
}

function createImageHandler(view: EditorView, type: "paste" | "drop", data: DataTransfer) {
  const files: File[] = [];
  if (type === "paste") {
    const items = data.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
  } else {
    if (data.files) {
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i];
        if (file.type.startsWith("image/")) files.push(file);
      }
    }
  }
  if (files.length === 0) return false;
  if (!props.filePath) return false;

  const mdFilePath = props.filePath;
  for (const file of files) {
    const ext = file.name.split(".").pop() || "png";
    file.arrayBuffer().then(async (buf) => {
      const imageData = new Uint8Array(buf);
      try {
        const ref = await saveImageToAssets(mdFilePath, imageData, ext);
        const markdown = `![](${ref})`;
        const pos = view.state.selection.main.head;
        view.dispatch({
          changes: { from: pos, insert: markdown },
          selection: { anchor: pos + markdown.length },
        });
      } catch (e) {
        console.error("Failed to save image:", e);
      }
    });
  }
  return true;
}

function imageDropExtension() {
  return EditorView.domEventHandlers({
    paste(event, view) {
      return createImageHandler(view, "paste", event.clipboardData!);
    },
    drop(event, view) {
      return createImageHandler(view, "drop", event.dataTransfer!);
    },
  });
}

function createState(content: string): EditorState {
  return EditorState.create({
    doc: content,
    extensions: [
      lineNumbersCompartment.of(props.lineNumbers ? lineNumbers() : []),
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
      wrapCompartment.of(props.lineWrapping ? EditorView.lineWrapping : []),
      themeCompartment.of(createTheme(props.fontSize)),
      placeholder("Start writing markdown..."),
      imageDropExtension(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !ignoreNextUpdate) {
          emit("update:modelValue", update.state.doc.toString());
        }
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

      // Restore scroll position and cursor after tab switch
      if (props.restoreScrollTop || props.restoreCursorPos) {
        requestAnimationFrame(() => {
          if (!view) return;
          if (props.restoreCursorPos) {
            const pos = Math.min(props.restoreCursorPos, view.state.doc.length);
            view.dispatch({ selection: { anchor: pos } });
          }
          if (props.restoreScrollTop) {
            view.scrollDOM.scrollTop = props.restoreScrollTop;
          }
        });
      }
    }
  }
);

watch(() => props.fontSize, (size) => {
  view?.dispatch({
    effects: themeCompartment.reconfigure(createTheme(size)),
  });
});

watch(() => props.lineWrapping, (on) => {
  view?.dispatch({
    effects: wrapCompartment.reconfigure(on ? EditorView.lineWrapping : []),
  });
});

watch(() => props.lineNumbers, (on) => {
  view?.dispatch({
    effects: lineNumbersCompartment.reconfigure(on ? lineNumbers() : []),
  });
});

defineExpose({
  getView: () => view,
});
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
