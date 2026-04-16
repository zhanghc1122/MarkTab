import { computed, type Ref } from "vue";

export interface TocItem {
  level: number;
  text: string;
  lineIndex: number;
  id: string;
  index: number;
}

export function useTableOfContents(source: Ref<string>) {
  const headings = computed<TocItem[]>(() => {
    const lines = source.value.split("\n");
    const result: TocItem[] = [];
    const headingRe = /^(#{1,6})\s+(.+)$/;

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(headingRe);
      if (match) {
        result.push({
          level: match[1].length,
          text: match[2].replace(/[*_`~\[\]]/g, "").trim(),
          lineIndex: i,
          id: `toc-heading-${result.length}`,
          index: result.length,
        });
      }
    }
    return result;
  });

  return { headings };
}
