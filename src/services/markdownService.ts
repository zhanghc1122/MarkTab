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
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

// Store default image renderer for fallback
const defaultImageRenderer = md.renderer.rules.image;

function isLocalPath(src: string): boolean {
  if (/^https?:\/\//i.test(src)) return false;
  if (/^data:/i.test(src)) return false;
  return true;
}

function resolveImagePath(src: string, filePath: string): string {
  if (!isLocalPath(src)) return src;

  let absolutePath: string;
  if (/^[A-Za-z]:[\\/]/.test(src) || /^\//.test(src)) {
    absolutePath = src;
  } else {
    const lastSep = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
    const dir = lastSep >= 0 ? filePath.substring(0, lastSep) : filePath;
    const sep = filePath.includes("\\") ? "\\" : "/";
    absolutePath = dir + sep + src;
  }

  return convertFileSrc(absolutePath);
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
