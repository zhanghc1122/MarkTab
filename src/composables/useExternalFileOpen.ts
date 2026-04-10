import { listen } from "@tauri-apps/api/event";
import { readFileContent } from "../services/fileIoService";
import { useFileStore } from "../stores/fileStore";
import { useTabStore } from "../stores/tabStore";

export function useExternalFileOpen() {
  const fileStore = useFileStore();
  const tabStore = useTabStore();

  async function openFileFromPath(path: string) {
    try {
      const content = await readFileContent(path);
      const entry = fileStore.addFile(path);
      tabStore.openTab(entry, content);
      fileStore.persistState();
    } catch (e) {
      console.error("Failed to open external file:", e);
    }
  }

  listen<string>("open-file", (event) => {
    const path = event.payload;
    if (path) {
      openFileFromPath(path);
    }
  });
}
