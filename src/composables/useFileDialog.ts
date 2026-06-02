import { openFileDialog as tauriOpenFile, readFileContent } from "../services/fileIoService";
import { useFileStore } from "../stores/fileStore";
import { useTabStore } from "../stores/tabStore";
import { useAppConfigStore } from "../stores/appConfigStore";
import { useDirectoryStore } from "../stores/directoryStore";

export async function openFileFromDialog() {
  const fileStore = useFileStore();
  const tabStore = useTabStore();
  const configStore = useAppConfigStore();
  const dirStore = useDirectoryStore();

  // Surface Quick Open first so the user sees the result land in Recents.
  if (configStore.config.preferences.sidebarView !== "quickAccess") {
    configStore.config.preferences.sidebarView = "quickAccess";
    await configStore.persist();
  }

  const path = await tauriOpenFile();
  if (!path) return;
  try {
    const content = await readFileContent(path);
    const entry = fileStore.addFile(path);
    tabStore.openTab(entry, content);
    dirStore.trackFileOpen(path);
    fileStore.persistState();
  } catch (e) {
    // TODO: surface via toast once a toast component exists.
    console.error("Failed to open file:", e);
  }
}

export function useFileDialog() {
  return { openFile: openFileFromDialog };
}
