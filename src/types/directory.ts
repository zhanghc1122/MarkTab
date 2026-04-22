export type SortField = "name" | "time";
export type SortOrder = "asc" | "desc";

export interface DirectoryEntry {
  dirPath: string;
  dirName: string;
  lastAccessed: number;
}

export interface DirectoryChild {
  name: string;
  filePath: string;
  mtime: number | null;
}

export interface DirectoryNode {
  dirPath: string;
  dirName: string;
  expanded: boolean;
  children: DirectoryChild[];
  loading: boolean;
}
