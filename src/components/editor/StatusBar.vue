<script setup lang="ts">
import type { DocumentStats } from "../../composables/useDocumentStats";

defineProps<{
  stats: DocumentStats;
}>();
</script>

<template>
  <div class="status-bar">
    <div class="stats-group">
      <span class="stat-item">
        <span class="stat-label">Chinese Chars</span>
        <span class="stat-value">{{ stats.chineseChars }}</span>
      </span>
      <span class="stat-divider"></span>
      <span class="stat-item">
        <span class="stat-label">English Words</span>
        <span class="stat-value">{{ stats.englishWords }}</span>
      </span>
    </div>
    <span class="stat-divider"></span>
    <div class="stats-group">
      <span class="stat-item">
        <span class="stat-label">Headings</span>
        <span class="stat-value">{{ stats.headings }}</span>
      </span>
      <span class="stat-divider"></span>
      <span class="stat-item">
        <span class="stat-label">Code Blocks</span>
        <span class="stat-value">{{ stats.codeBlocks }}</span>
      </span>
      <span class="stat-divider"></span>
      <span class="stat-item">
        <span class="stat-label">Tables</span>
        <span class="stat-value">{{ stats.tables }}</span>
      </span>
    </div>
    <span class="stat-divider"></span>
    <div class="stats-group">
      <span class="stat-item">
        <span class="stat-label">Images</span>
        <span class="stat-value">{{ stats.images }}</span>
      </span>
      <span class="stat-divider"></span>
      <span class="stat-item">
        <span class="stat-label">Links</span>
        <span class="stat-value">{{ stats.links }}</span>
      </span>
      <span class="stat-divider"></span>
      <span class="stat-item">
        <span class="stat-label">Mermaid</span>
        <span class="stat-value">{{ stats.mermaidDiagrams }}</span>
      </span>
      <span class="stat-divider"></span>
      <span class="stat-item">
        <span class="stat-label">DrawIO</span>
        <span class="stat-value">{{ stats.drawioDiagrams }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 24px;
  min-height: 24px;
  padding: 0 12px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  gap: 0;
  flex-shrink: 0;
}

.stats-group {
  display: flex;
  align-items: center;
  gap: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 6px;
}

.stat-label {
  font-size: 11px;
  color: #9ca3af;
}

.stat-value {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.stat-divider {
  width: 1px;
  height: 12px;
  background: #d1d5db;
}

@media (prefers-color-scheme: dark) {
  .status-bar {
    background: #252526;
    border-top-color: #444;
  }

  .stat-label {
    color: #6b7280;
  }

  .stat-value {
    color: #9ca3af;
  }

  .stat-divider {
    background: #555;
  }
}
</style>
