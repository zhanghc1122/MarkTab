import { defineStore } from "pinia";
import { ref } from "vue";
import type { AppConfig } from "../types/config";
import { DEFAULT_CONFIG } from "../types/config";
import { loadConfig, saveConfig } from "../services/configService";

export const useAppConfigStore = defineStore("appConfig", () => {
  const config = ref<AppConfig>({ ...DEFAULT_CONFIG });
  const initialized = ref(false);

  async function init() {
    if (initialized.value) return;
    config.value = await loadConfig();
    initialized.value = true;
  }

  async function persist() {
    await saveConfig(config.value);
  }

  function setEditorMode(mode: "edit" | "preview") {
    config.value.preferences.editorMode = mode;
  }

  function setAutoSaveDelay(delay: number) {
    config.value.preferences.autoSaveDelay = delay;
  }

  function setSidebarWidth(width: number) {
    config.value.preferences.sidebarWidth = width;
  }

  return {
    config,
    initialized,
    init,
    persist,
    setEditorMode,
    setAutoSaveDelay,
    setSidebarWidth,
  };
});
