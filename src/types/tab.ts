export interface TabState {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  originalContent: string;
  scrollTop: number;
  cursorPos: number;
  isDirty: boolean;
}
