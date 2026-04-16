import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { convertFileSrc } from "@tauri-apps/api/core";
import { readTextFile } from "@tauri-apps/plugin-fs";

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

const DRAWIO_EXTENSIONS = /\.drawio$/i;

function resolveAbsolutePath(src: string, filePath: string): string | null {
  if (!isLocalPath(src)) return null;

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

  return normalizePath(absolutePath);
}

md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const srcAttr = token.attrGet("src");
  const envObj = env as { filePath?: string };

  if (srcAttr && envObj.filePath) {
    const absolutePath = resolveAbsolutePath(srcAttr, envObj.filePath);

    if (absolutePath && DRAWIO_EXTENSIONS.test(absolutePath)) {
      const alt = md.utils.escapeHtml(token.content || "");
      const escapedPath = md.utils.escapeHtml(absolutePath);
      return `<div class="drawio-placeholder" data-drawio-path="${escapedPath}" data-alt="${alt}">` +
             `<p>Loading diagram: ${alt || escapedPath}</p></div>`;
    }

    if (absolutePath) {
      token.attrSet("src", convertFileSrc(absolutePath));
    }
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

let drawioViewerLoaded: Promise<void> | null = null;

function loadDrawioViewer(): Promise<void> {
  if (drawioViewerLoaded) return drawioViewerLoaded;

  drawioViewerLoaded = new Promise<void>((resolve, reject) => {
    if (typeof (window as any).GraphViewer !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "/js/viewer.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load draw.io viewer"));
    document.head.appendChild(script);
  });

  return drawioViewerLoaded;
}

export async function renderDrawioBlocks(container: HTMLElement): Promise<void> {
  const placeholders = container.querySelectorAll<HTMLDivElement>(".drawio-placeholder");
  if (placeholders.length === 0) return;

  try {
    await loadDrawioViewer();
  } catch {
    for (const el of placeholders) {
      el.innerHTML = `<p style="color:red;">Failed to load draw.io viewer</p>`;
    }
    return;
  }

  const GraphViewer = (window as any).GraphViewer;

  for (const placeholder of placeholders) {
    const filePath = placeholder.getAttribute("data-drawio-path");
    if (!filePath) continue;

    try {
      const xmlContent = await readTextFile(filePath);

      const viewerDiv = document.createElement("div");
      viewerDiv.className = "mxgraph drawio-diagram";
      viewerDiv.setAttribute("data-mxgraph", JSON.stringify({
        xml: xmlContent,
        toolbar: "zoom layers",
        resize: true,
      }));

      placeholder.replaceWith(viewerDiv);

      if (GraphViewer && typeof GraphViewer.processElements === "function") {
        GraphViewer.processElements();
      }
    } catch {
      placeholder.innerHTML = `<p style="color:red; border: 1px solid #e0e0e0; padding: 12px; border-radius: 4px; background: #fff5f5;">` +
        `<strong>Diagram not found:</strong> ${md.utils.escapeHtml(filePath)}</p>`;
    }
  }
}
