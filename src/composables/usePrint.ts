import type { TabState } from "../types/tab";
import {
  renderDrawioBlocks,
  renderMarkdown,
  renderMermaidBlocks,
} from "../services/markdownService";

const PRINT_ROOT_ID = "markdown-print-root";
const PRINT_FONT_SCALE = 0.92;
const PRINTING_CLASS = "is-printing-document";

interface PrintOptions {
  fontSize?: number;
}

function getPrintRoot(): HTMLElement {
  const existing = document.getElementById(PRINT_ROOT_ID);
  if (existing) return existing;

  const root = document.createElement("div");
  root.id = PRINT_ROOT_ID;
  root.className = "markdown-print-root";
  document.body.appendChild(root);
  return root;
}

function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  const pending = images.filter((img) => !img.complete);

  if (pending.length === 0) return Promise.resolve();

  return Promise.all(
    pending.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
}

async function waitForPrintReady(container: HTMLElement): Promise<void> {
  await renderMermaidBlocks(container);
  await renderDrawioBlocks(container);
  await waitForImages(container);

  if (document.fonts) {
    await document.fonts.ready;
  }
}

export function usePrint() {
  let isPrinting = false;

  async function printTab(tab: TabState | null, options: PrintOptions = {}) {
    if (!tab || isPrinting) return;

    isPrinting = true;
    document.body.classList.add(PRINTING_CLASS);

    const root = getPrintRoot();
    root.innerHTML = "";

    const article = document.createElement("article");
    article.className = "markdown-preview";
    const printFontSize = Math.max(10, (options.fontSize ?? 14) * PRINT_FONT_SCALE);
    article.style.fontSize = `${printFontSize}px`;
    article.innerHTML = renderMarkdown(tab.content, tab.filePath);
    root.appendChild(article);

    try {
      await waitForPrintReady(article);
      window.print();
    } catch (err) {
      console.error("Failed to print document:", err);
    } finally {
      window.setTimeout(() => {
        root.innerHTML = "";
        document.body.classList.remove(PRINTING_CLASS);
        isPrinting = false;
      }, 500);
    }
  }

  return { printTab };
}
