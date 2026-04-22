export interface SkillDir {
  name: string;
  description: string;
  dirPath: string;
  dirName: string;
  skillMdPath: string;
  expanded: boolean;
  children: SkillChild[];
}

export interface SkillChild {
  name: string;
  filePath: string;
  relativePath: string;
}
