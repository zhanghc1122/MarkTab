import { computed, type ComputedRef, type Ref } from "vue";

export interface DocumentStats {
  chineseChars: number;
  englishWords: number;
  images: number;
  codeBlocks: number;
  links: number;
  headings: number;
  tables: number;
  mermaidDiagrams: number;
  drawioDiagrams: number;
}

export function useDocumentStats(source: Ref<string>): {
  stats: ComputedRef<DocumentStats>;
} {
  const stats = computed<DocumentStats>(() => {
    const content = source.value;

    // Strip fenced code blocks for word counting
    const withoutCodeBlocks = content.replace(/^```[\s\S]*?^```/gm, "");
    // Strip inline code
    const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]+`/g, "");

    // Chinese characters: CJK Unified Ideographs
    const chineseChars = (
      content.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []
    ).length;

    // English words: Latin word sequences from prose only
    const englishWords = (
      withoutInlineCode.match(/[a-zA-Z]+(?:['-][a-zA-Z]+)*/g) || []
    ).length;

    // Images: ![alt](url)
    const images = (content.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length;

    // Code blocks: count opening fences / 2
    const codeBlocks = Math.floor(
      (content.match(/^```[a-zA-Z]*\s*$/gm) || []).length / 2
    );

    // Links: [text](url) excluding images, plus reference-style links
    const inlineLinks = (
      content.match(/(?<!!)\[[^\]]+\]\([^)]+\)/g) || []
    ).length;
    const refLinks = (
      content.match(/\[[^\]]+\]\[[^\]]*\]/g) || []
    ).length;
    const links = inlineLinks + refLinks;

    // Headings
    const headings = (content.match(/^#{1,6}\s+.+$/gm) || []).length;

    // Tables: GFM separator rows (|---|---|)
    const tables = (
      content.match(/^\|?\s*[-:]+[-|\s:]*$/gm) || []
    ).length;

    // Mermaid diagrams
    const mermaidDiagrams = (
      content.match(/^```mermaid\s*$/gm) || []
    ).length;

    // Drawio diagrams: images referencing .drawio files
    const drawioDiagrams = (
      content.match(/!\[[^\]]*\]\([^)]*\.drawio[^)]*\)/gi) || []
    ).length;

    return {
      chineseChars,
      englishWords,
      images,
      codeBlocks,
      links,
      headings,
      tables,
      mermaidDiagrams,
      drawioDiagrams,
    };
  });

  return { stats };
}
