export function extractFileName(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || filePath;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function extractDirName(dirPath: string): string {
  const normalized = dirPath.replace(/\\/g, "/").replace(/\/$/, "");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || dirPath;
}

export function extractParentDir(filePath: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  if (parts.length < 2) return null;
  return parts.slice(0, -1).join("/");
}

export function extractBaseName(filePath: string): string {
  const fileName = extractFileName(filePath);
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}
