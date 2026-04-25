import { readTextFile, writeTextFile, exists, readDir, stat, writeFile, mkdir } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { generateId, extractParentDir, extractBaseName } from "../utils/pathUtils";

export const selfWriteTimestamps = new Map<string, number>();

export async function readFileContent(path: string): Promise<string> {
  return await readTextFile(path);
}

export async function writeFileContent(
  path: string,
  content: string
): Promise<void> {
  await writeTextFile(path, content);
  selfWriteTimestamps.set(path, Date.now());
}

export async function fileExists(path: string): Promise<boolean> {
  return await exists(path);
}

export async function openFileDialog(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "Markdown",
        extensions: ["md", "markdown", "txt"],
      },
    ],
  });
  if (selected === null) return null;
  return typeof selected === "string" ? selected : selected;
}

export async function saveFileDialog(
  defaultPath?: string
): Promise<string | null> {
  return await save({
    defaultPath,
    filters: [
      {
        name: "Markdown",
        extensions: ["md"],
      },
    ],
  });
}

export async function openDirectoryDialog(): Promise<string | null> {
  const selected = await open({ directory: true, multiple: false });
  if (selected === null) return null;
  return typeof selected === "string" ? selected : selected;
}

export async function readDirectory(dirPath: string) {
  return await readDir(dirPath);
}

export async function statFile(path: string) {
  return await stat(path);
}

export async function saveImageToAssets(
  mdFilePath: string,
  imageData: Uint8Array,
  imageExt: string
): Promise<string> {
  const parentDir = extractParentDir(mdFilePath);
  if (!parentDir) throw new Error("Cannot determine parent directory");
  const baseName = extractBaseName(mdFilePath);
  const assetsDir = `${parentDir}/${baseName}.assets`;
  await mkdir(assetsDir, { recursive: true });
  const imageName = `image-${Date.now()}-${generateId().slice(0, 6)}.${imageExt}`;
  const imagePath = `${assetsDir}/${imageName}`;
  await writeFile(imagePath, imageData);
  return `./${baseName}.assets/${imageName}`;
}
