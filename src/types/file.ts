export interface FileEntry {
  id: string;
  filePath: string;
  fileName: string;
  lastOpened: number;
  fileStatus?: "deleted" | "modified";
  diskMtime?: Date | null;
}
