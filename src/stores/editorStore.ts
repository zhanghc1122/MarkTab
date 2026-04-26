import { defineStore } from "pinia";
import { ref } from "vue";
import type { EditorMode } from "../types/config";

export const useEditorStore = defineStore("editor", () => {
  const isPreviewMode = ref(false);
  const tocOpen = ref(false);

  function toggleMode() {
    isPreviewMode.value = !isPreviewMode.value;
  }

  function setMode(mode: EditorMode) {
    isPreviewMode.value = mode === "preview";
  }

  function toggleToc() {
    tocOpen.value = !tocOpen.value;
  }

  return { isPreviewMode, tocOpen, toggleMode, setMode, toggleToc };
});
