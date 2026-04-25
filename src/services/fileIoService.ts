import { readTextFile, writeTextFile, exists, readDir } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";

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
