import type { DirectoryEntry, SortField, SortOrder } from "./directory";
import type { FileEntry } from "./file";

export type SidebarView = "files" | "quickAccess" | "sessions" | "skills";

export interface AppConfig {
  version: number;
  recentFiles: FileEntry[];
  favoriteDirs: DirectoryEntry[];
  recentDirs: DirectoryEntry[];
  dirSortField: SortField;
  dirSortOrder: SortOrder;
  preferences: {
    autoSaveDelay: number;
    sidebarWidth: number;
    sidebarView: SidebarView;
    editorMode: "edit" | "preview";
    fontSize: number;
    lineWrapping: boolean;
    lineNumbers: boolean;
  };
}

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  recentFiles: [],
  favoriteDirs: [],
  recentDirs: [],
  dirSortField: "name",
  dirSortOrder: "asc",
  preferences: {
    autoSaveDelay: 2000,
    sidebarWidth: 260,
    sidebarView: "files",
    editorMode: "edit",
    fontSize: 14,
    lineWrapping: true,
    lineNumbers: true,
  },
};
