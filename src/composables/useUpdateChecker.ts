import { ref } from "vue";
import { open } from "@tauri-apps/plugin-shell";

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  releaseUrl: string;
  releaseNotes: string;
}

const GITHUB_REPO = "zhanghc1122/MarkTab";
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const RELEASE_URL = `https://github.com/${GITHUB_REPO}/releases/latest`;

const updateInfo = ref<UpdateInfo | null>(null);
const checking = ref(false);

function parseVersion(tag: string): number[] {
  return tag
    .replace(/^v/, "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
}

function isNewerVersion(latest: string, current: string): boolean {
  const l = parseVersion(latest);
  const c = parseVersion(current);
  for (let i = 0; i < 3; i++) {
    if ((l[i] ?? 0) > (c[i] ?? 0)) return true;
    if ((l[i] ?? 0) < (c[i] ?? 0)) return false;
  }
  return false;
}

export function useUpdateChecker() {
  async function checkForUpdate(silent = true): Promise<UpdateInfo | null> {
    if (checking.value) return null;
    checking.value = true;

    try {
      const resp = await fetch(API_URL, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      const latestTag = data.tag_name as string;
      const currentVersion = __APP_VERSION__;

      const hasUpdate = isNewerVersion(latestTag, currentVersion);
      const notes = (data.body as string || "").slice(0, 500);

      updateInfo.value = {
        hasUpdate,
        latestVersion: latestTag.replace(/^v/, ""),
        currentVersion,
        releaseUrl: hasUpdate ? data.html_url : RELEASE_URL,
        releaseNotes: notes,
      };

      return updateInfo.value;
    } catch {
      if (!silent) {
        updateInfo.value = {
          hasUpdate: false,
          latestVersion: "",
          currentVersion: __APP_VERSION__,
          releaseUrl: "",
          releaseNotes: "Failed to check for updates. Please try again later.",
        };
      }
      return null;
    } finally {
      checking.value = false;
    }
  }

  function openReleasePage() {
    if (updateInfo.value?.releaseUrl) {
      open(updateInfo.value.releaseUrl);
    }
  }

  return {
    updateInfo,
    checking,
    checkForUpdate,
    openReleasePage,
  };
}
