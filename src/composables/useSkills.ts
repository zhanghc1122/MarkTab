import { ref } from "vue";
import { homeDir, join } from "@tauri-apps/api/path";
import { readDirectory, readFileContent } from "../services/fileIoService";
import type { SkillDir, SkillChild } from "../types/skill";

const skills = ref<SkillDir[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

function parseFrontmatter(content: string): { name?: string; description?: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const nameMatch = yaml.match(/^name:\s*(.+)$/m);
  const descMatch = yaml.match(/^description:\s*(.+)$/m);
  return {
    name: nameMatch?.[1]?.trim().replace(/^["']|["']$/g, ""),
    description: descMatch?.[1]?.trim().replace(/^["']|["']$/g, ""),
  };
}

async function scanMdFiles(dirPath: string, parentRelative = ""): Promise<SkillChild[]> {
  const entries = await readDirectory(dirPath);
  const mdFiles: SkillChild[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = await join(dirPath, entry.name);
    const relativePath = parentRelative ? `${parentRelative}/${entry.name}` : entry.name;

    if (entry.isFile && entry.name.endsWith(".md") && entry.name !== "SKILL.md") {
      mdFiles.push({ name: entry.name, filePath: fullPath, relativePath });
    } else if (entry.isDirectory) {
      const subFiles = await scanMdFiles(fullPath, relativePath);
      mdFiles.push(...subFiles);
    }
  }
  return mdFiles;
}

async function loadSkills() {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    const home = await homeDir();
    const skillsRoot = await join(home, ".claude", "skills");
    const entries = await readDirectory(skillsRoot);

    const dirs: SkillDir[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory || entry.name.startsWith(".")) continue;
      const dirPath = await join(skillsRoot, entry.name);
      dirs.push({
        name: entry.name,
        description: "",
        dirPath,
        dirName: entry.name,
        skillMdPath: await join(dirPath, "SKILL.md"),
        expanded: false,
        children: [],
      });
    }

    dirs.sort((a, b) => a.name.localeCompare(b.name));
    skills.value = dirs;
  } catch (e) {
    console.error("Failed to load skills:", e);
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

async function toggleExpand(dirPath: string) {
  const skill = skills.value.find((s) => s.dirPath === dirPath);
  if (!skill) return;

  if (skill.expanded) {
    skill.expanded = false;
    return;
  }

  skill.expanded = true;

  if (skill.children.length === 0 && !skill.description) {
    try {
      const [content, children] = await Promise.all([
        readFileContent(skill.skillMdPath).catch(() => ""),
        scanMdFiles(skill.dirPath),
      ]);

      if (content) {
        const frontmatter = parseFrontmatter(content.slice(0, 500));
        if (frontmatter.name) skill.name = frontmatter.name;
        if (frontmatter.description) {
          skill.description =
            frontmatter.description.length > 80
              ? frontmatter.description.slice(0, 80) + "..."
              : frontmatter.description;
        }
      }

      skill.children = children;
    } catch {
      // leave children empty on error
    }
  }
}

export function useSkills() {
  return { skills, loading, error, loadSkills, toggleExpand };
}
