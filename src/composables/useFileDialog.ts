import { openFileDialog as tauriOpenFile, readFileContent } from "../services/fileIoService";
import { useFileStore } from "../stores/fileStore";
import { useTabStore } from "../stores/tabStore";

export function useFileDialog() {
  const fileStore = useFileStore();
  const tabStore = useTabStore();

  async function openFile() {
    const path = await tauriOpenFile();
    if (!path) return;
    try {
      const content = await readFileContent(path);
      const entry = fileStore.addFile(path);
      tabStore.openTab(entry, content);
      fileStore.persistState();
    } catch (e) {
      console.error("Failed to open file:", e);
    }
  }

  return { openFile };
}
