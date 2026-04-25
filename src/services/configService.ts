import { appDataDir } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile, mkdir, exists } from "@tauri-apps/plugin-fs";
import type { AppConfig } from "../types/config";
import { DEFAULT_CONFIG } from "../types/config";

const CONFIG_FILE = "marktab-config.json";

let configDir: string | null = null;

async function getConfigDir(): Promise<string> {
  if (configDir) return configDir;
  configDir = await appDataDir();
  return configDir;
}

async function getConfigPath(): Promise<string> {
  const dir = await getConfigDir();
  // Ensure directory exists
  if (!(await exists(dir))) {
    await mkdir(dir, { recursive: true });
  }
  return dir + CONFIG_FILE;
}

export async function loadConfig(): Promise<AppConfig> {
  try {
    const path = await getConfigPath();
    if (!(await exists(path))) {
      return { ...DEFAULT_CONFIG };
    }
    const raw = await readTextFile(path);
    const config = JSON.parse(raw) as AppConfig;
    return {
      ...DEFAULT_CONFIG,
      ...config,
      preferences: { ...DEFAULT_CONFIG.preferences, ...config.preferences },
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  try {
    const path = await getConfigPath();
    await writeTextFile(path, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error("Failed to save config:", e);
  }
}
