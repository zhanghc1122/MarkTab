import type { FileEntry, FileGroup } from "./file";

export interface AppConfig {
  version: number;
  recentFiles: FileEntry[];
  groups: FileGroup[];
  preferences: {
    autoSaveDelay: number;
    sidebarWidth: number;
    editorMode: "edit" | "preview";
    fontSize: number;
    lineWrapping: boolean;
    lineNumbers: boolean;
  };
}

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  recentFiles: [],
  groups: [],
  preferences: {
    autoSaveDelay: 2000,
    sidebarWidth: 260,
    editorMode: "edit",
    fontSize: 14,
    lineWrapping: true,
    lineNumbers: true,
  },
};
