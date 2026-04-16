import { defineStore } from "pinia";
import { ref } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const isPreviewMode = ref(false);
  const tocOpen = ref(false);

  function toggleMode() {
    isPreviewMode.value = !isPreviewMode.value;
  }

  function setMode(mode: "edit" | "preview") {
    isPreviewMode.value = mode === "preview";
  }

  function toggleToc() {
    tocOpen.value = !tocOpen.value;
  }

  return { isPreviewMode, tocOpen, toggleMode, setMode, toggleToc };
});
