import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { convertFileSrc } from "@tauri-apps/api/core";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch {
        // fall through
      }
    }
    // Return plain escaped content so markdown-it wraps it with language-xxx class
    return md.utils.escapeHtml(str);
  },
});

// Store default image renderer for fallback
const defaultImageRenderer = md.renderer.rules.image;

function isLocalPath(src: string): boolean {
  if (/^https?:\/\//i.test(src)) return false;
  if (/^data:/i.test(src)) return false;
  return true;
}

function normalizePath(path: string): string {
  const parts = path.split(/[/\\]+/);
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      if (resolved.length > 1) {
        resolved.pop();
      }
    } else if (part !== "." && part !== "") {
      resolved.push(part);
    }
  }
  return resolved.join("\\");
}

function resolveImagePath(src: string, filePath: string): string {
  if (!isLocalPath(src)) return src;

  // markdown-it may URL-encode non-ASCII chars in image src; decode first
  let decodedSrc: string;
  try {
    decodedSrc = decodeURIComponent(src);
  } catch {
    decodedSrc = src;
  }

  let absolutePath: string;
  if (/^[A-Za-z]:[\\/]/.test(decodedSrc) || /^\//.test(decodedSrc)) {
    absolutePath = decodedSrc;
  } else {
    const lastSep = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
    const dir = lastSep >= 0 ? filePath.substring(0, lastSep) : filePath;
    const sep = filePath.includes("\\") ? "\\" : "/";
    absolutePath = dir + sep + decodedSrc;
  }

  const normalized = normalizePath(absolutePath);
  return convertFileSrc(normalized);
}

md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const srcAttr = token.attrGet("src");

  if (srcAttr && (env as { filePath?: string }).filePath) {
    const resolved = resolveImagePath(srcAttr, (env as { filePath: string }).filePath);
    token.attrSet("src", resolved);
  }

  return defaultImageRenderer
    ? defaultImageRenderer(tokens, idx, options, env, self)
    : self.renderToken(tokens, idx, options);
};

export function renderMarkdown(source: string, filePath?: string): string {
  return md.render(source, { filePath });
}

let mermaidReady: Promise<typeof import("mermaid")> | null = null;

function loadMermaid() {
  if (!mermaidReady) {
    mermaidReady = import("mermaid").then((m) => {
      m.default.initialize({ startOnLoad: false, theme: "default" });
      return m;
    });
  }
  return mermaidReady;
}

export async function renderMermaidBlocks(container: HTMLElement): Promise<void> {
  const codeBlocks = container.querySelectorAll<HTMLElement>("pre code.language-mermaid");
  if (codeBlocks.length === 0) return;

  const m = await loadMermaid();

  for (const block of codeBlocks) {
    const code = block.textContent ?? "";
    const wrapper = document.createElement("div");
    wrapper.className = "mermaid-diagram";
    try {
      const { svg } = await m.default.render(`mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`, code);
      wrapper.innerHTML = svg;
    } catch {
      wrapper.innerHTML = `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`;
    }
    const pre = block.closest("pre");
    if (pre) {
      pre.replaceWith(wrapper);
    } else {
      block.replaceWith(wrapper);
    }
  }
}
