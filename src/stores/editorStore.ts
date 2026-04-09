import { defineStore } from "pinia";
import { ref } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const isPreviewMode = ref(false);

  function toggleMode() {
    isPreviewMode.value = !isPreviewMode.value;
  }

  function setMode(mode: "edit" | "preview") {
    isPreviewMode.value = mode === "preview";
  }

  return { isPreviewMode, toggleMode, setMode };
});
