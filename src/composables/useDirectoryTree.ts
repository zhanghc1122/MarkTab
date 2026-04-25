import { readDir, stat } from "@tauri-apps/plugin-fs";
import type { DirectoryChild } from "../types/directory";
import { useDirectoryStore } from "../stores/directoryStore";
import { useFileStore } from "../stores/fileStore";
import { useTabStore } from "../stores/tabStore";
import { readFileContent } from "../services/fileIoService";

export function useDirectoryTree() {
  async function loadDirectoryChildren(dirPath: string): Promise<DirectoryChild[]> {
    const entries = await readDir(dirPath);
    const children: DirectoryChild[] = [];
    const normalized = dirPath.replace(/\\/g, "/");
    for (const entry of entries) {
      if (entry.isDirectory) {
        children.push({
          name: entry.name,
          filePath: `${normalized}/${entry.name}`,
          mtime: null,
          isDir: true,
          children: [],
        });
      } else if (entry.isFile && (entry.name?.endsWith(".md") || entry.name?.endsWith(".markdown"))) {
        children.push({
          name: entry.name ?? "",
          filePath: `${normalized}/${entry.name}`,
          mtime: null,
          isDir: false,
        });
      }
    }
    await Promise.all(
      children.map(async (child) => {
        if (!child.isDir) {
          try {
            const info = await stat(child.filePath);
            child.mtime = info.mtime?.getTime() ?? null;
          } catch {
            child.mtime = null;
          }
        }
      }),
    );
    children.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });
    return children;
  }

  async function expandDirectory(dirPath: string) {
    const dirStore = useDirectoryStore();
    const node = dirStore.getNode(dirPath);
    if (node && node.expanded) {
      dirStore.toggleNode(dirPath);
      return;
    }
    if (!node) {
      dirStore.setNode(dirPath, {
        dirPath,
        dirName: "",
        expanded: true,
        children: [],
        loading: true,
      });
    } else {
      node.loading = true;
      node.expanded = true;
    }
    try {
      const children = await loadDirectoryChildren(dirPath);
      const existing = dirStore.getNode(dirPath);
      if (existing) {
        existing.children = children;
        existing.loading = false;
      }
    } catch {
      const existing = dirStore.getNode(dirPath);
      if (existing) existing.loading = false;
    }
  }

  async function openFileFromDir(filePath: string) {
    const fileStore = useFileStore();
    const tabStore = useTabStore();
    const dirStore = useDirectoryStore();

    const existingTab = tabStore.tabs.find((t) => t.filePath === filePath);
    if (existingTab) {
      tabStore.setActiveTab(existingTab.id);
      return;
    }

    try {
      const content = await readFileContent(filePath);
      const fileEntry = fileStore.addFile(filePath);
      tabStore.openTab(fileEntry, content);
      dirStore.trackFileOpen(filePath);
    } catch {
      // File read failed silently
    }
  }

  return { expandDirectory, openFileFromDir };
}
