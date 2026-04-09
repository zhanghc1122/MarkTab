export interface FileEntry {
  id: string;
  filePath: string;
  fileName: string;
  lastOpened: number;
  groupId: string | null;
}

export interface FileGroup {
  id: string;
  name: string;
  color?: string;
  collapsed: boolean;
  order: number;
}
