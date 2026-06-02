import { generateId } from "../utils/pathUtils";

export type ChangeDecision = "pending" | "accept" | "keep";
export type ChangeLineType = "context" | "added" | "removed";

export interface ChangeLine {
  id: string;
  type: ChangeLineType;
  text: string;
  oldLine?: number;
  newLine?: number;
  blockId?: string;
}

export interface ChangeBlock {
  id: string;
  lineIds: string[];
  decision: ChangeDecision;
}

export interface ChangeReviewSession {
  baseContent: string;
  externalContent: string;
  lines: ChangeLine[];
  blocks: ChangeBlock[];
  eol: "\n" | "\r\n";
  trailingNewline: boolean;
}

interface SplitContent {
  lines: string[];
  eol: "\n" | "\r\n";
  trailingNewline: boolean;
}

function splitContent(content: string): SplitContent {
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  const normalized = content.replace(/\r\n/g, "\n");
  const trailingNewline = normalized.endsWith("\n");
  const lines = normalized.length === 0
    ? []
    : normalized.replace(/\n$/, "").split("\n");

  return { lines, eol, trailingNewline };
}

function createLcsTable(oldLines: string[], newLines: string[]): number[][] {
  const table = Array.from({ length: oldLines.length + 1 }, () =>
    new Array<number>(newLines.length + 1).fill(0)
  );

  for (let i = oldLines.length - 1; i >= 0; i--) {
    for (let j = newLines.length - 1; j >= 0; j--) {
      table[i][j] = oldLines[i] === newLines[j]
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  return table;
}

function createChangeLine(
  type: ChangeLineType,
  text: string,
  oldLine?: number,
  newLine?: number,
): ChangeLine {
  return {
    id: generateId(),
    type,
    text,
    oldLine,
    newLine,
  };
}

function assignBlocks(lines: ChangeLine[]): ChangeBlock[] {
  const blocks: ChangeBlock[] = [];
  let current: ChangeBlock | null = null;

  for (const line of lines) {
    if (line.type === "context") {
      current = null;
      continue;
    }

    if (!current) {
      current = {
        id: generateId(),
        lineIds: [],
        decision: "pending",
      };
      blocks.push(current);
    }

    line.blockId = current.id;
    current.lineIds.push(line.id);
  }

  return blocks;
}

export function createReviewSession(
  baseContent: string,
  externalContent: string,
): ChangeReviewSession {
  const oldContent = splitContent(baseContent);
  const newContent = splitContent(externalContent);
  const table = createLcsTable(oldContent.lines, newContent.lines);
  const lines: ChangeLine[] = [];

  let i = 0;
  let j = 0;
  while (i < oldContent.lines.length || j < newContent.lines.length) {
    if (
      i < oldContent.lines.length &&
      j < newContent.lines.length &&
      oldContent.lines[i] === newContent.lines[j]
    ) {
      lines.push(createChangeLine("context", oldContent.lines[i], i + 1, j + 1));
      i++;
      j++;
    } else if (
      j < newContent.lines.length &&
      (i === oldContent.lines.length || table[i][j + 1] > table[i + 1][j])
    ) {
      lines.push(createChangeLine("added", newContent.lines[j], undefined, j + 1));
      j++;
    } else if (i < oldContent.lines.length) {
      lines.push(createChangeLine("removed", oldContent.lines[i], i + 1, undefined));
      i++;
    }
  }

  return {
    baseContent,
    externalContent,
    lines,
    blocks: assignBlocks(lines),
    eol: oldContent.eol,
    trailingNewline: oldContent.trailingNewline || newContent.trailingNewline,
  };
}

export function countChanges(session: ChangeReviewSession) {
  return session.lines.reduce(
    (acc, line) => {
      if (line.type === "added") acc.additions++;
      if (line.type === "removed") acc.deletions++;
      return acc;
    },
    { additions: 0, deletions: 0 },
  );
}

export function setBlockDecision(
  session: ChangeReviewSession,
  blockId: string,
  decision: Exclude<ChangeDecision, "pending">,
): ChangeReviewSession {
  return {
    ...session,
    blocks: session.blocks.map((block) =>
      block.id === blockId ? { ...block, decision } : block
    ),
  };
}

export function setAllDecisions(
  session: ChangeReviewSession,
  decision: Exclude<ChangeDecision, "pending">,
): ChangeReviewSession {
  return {
    ...session,
    blocks: session.blocks.map((block) => ({ ...block, decision })),
  };
}

export function hasPendingDecisions(session: ChangeReviewSession): boolean {
  return session.blocks.some((block) => block.decision === "pending");
}

export function buildReviewedContent(session: ChangeReviewSession): string {
  const decisions = new Map(
    session.blocks.map((block) => [block.id, block.decision])
  );
  const output: string[] = [];

  for (const line of session.lines) {
    if (line.type === "context") {
      output.push(line.text);
      continue;
    }

    const decision = line.blockId ? decisions.get(line.blockId) : "keep";
    if (line.type === "added" && decision === "accept") {
      output.push(line.text);
    }
    if (line.type === "removed" && decision !== "accept") {
      output.push(line.text);
    }
  }

  const content = output.join(session.eol);
  return session.trailingNewline && content.length > 0
    ? content + session.eol
    : content;
}

export function createUnifiedDiff(session: ChangeReviewSession): string {
  const rows = [`--- MarkTab current`, `+++ Disk version`];
  for (const line of session.lines) {
    if (line.type === "context") rows.push(` ${line.text}`);
    if (line.type === "removed") rows.push(`-${line.text}`);
    if (line.type === "added") rows.push(`+${line.text}`);
  }
  return rows.join("\n");
}
