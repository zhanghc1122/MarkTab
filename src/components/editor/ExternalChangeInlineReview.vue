<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  ChangeDecision,
  ChangeLine,
  ChangeReviewSession,
} from "../../services/changeReviewService";
import {
  countChanges,
  hasPendingDecisions,
} from "../../services/changeReviewService";

const props = defineProps<{
  fileName: string;
  session: ChangeReviewSession;
}>();

const emit = defineEmits<{
  acceptBlock: [blockId: string];
  keepBlock: [blockId: string];
  acceptAll: [];
  keepMine: [];
  saveBoth: [];
  copyDiff: [];
  done: [];
  exit: [];
}>();

interface InlineSegment {
  text: string;
  changed: boolean;
}

const counts = computed(() => countChanges(props.session));
const hasPending = computed(() => hasPendingDecisions(props.session));
const comparingBlockIds = ref(new Set<string>());
const blockById = computed(() =>
  new Map(props.session.blocks.map((block) => [block.id, block]))
);

watch(
  () => props.session,
  () => {
    const activeIds = new Set(props.session.blocks.map((block) => block.id));
    comparingBlockIds.value = new Set(
      [...comparingBlockIds.value].filter((blockId) => activeIds.has(blockId))
    );
  },
);

function getBlockDecision(blockId?: string): ChangeDecision {
  if (!blockId) return "keep";
  return blockById.value.get(blockId)?.decision ?? "pending";
}

function isHiddenByDecision(line: { type: string; blockId?: string }): boolean {
  const decision = getBlockDecision(line.blockId);
  if (decision === "pending" || isComparingBlock(line.blockId)) return false;
  return (
    (decision === "accept" && line.type === "removed") ||
    (decision === "keep" && line.type === "added")
  );
}

function isSelectedResultLine(line: { type: string; blockId?: string }): boolean {
  const decision = getBlockDecision(line.blockId);
  if (isComparingBlock(line.blockId)) return false;
  return (
    (decision === "accept" && line.type === "added") ||
    (decision === "keep" && line.type === "removed")
  );
}

function shouldShowInlineChange(line: ChangeLine): boolean {
  if (line.type === "context" || !line.blockId) return false;
  const decision = getBlockDecision(line.blockId);
  return decision === "pending" || isComparingBlock(line.blockId);
}

function getCounterpartLine(line: ChangeLine): ChangeLine | null {
  if (!line.blockId || line.type === "context") return null;
  const oppositeType = line.type === "added" ? "removed" : "added";
  const sameTypeLines = props.session.lines.filter(
    (item) => item.blockId === line.blockId && item.type === line.type
  );
  const oppositeLines = props.session.lines.filter(
    (item) => item.blockId === line.blockId && item.type === oppositeType
  );
  const lineIndex = sameTypeLines.findIndex((item) => item.id === line.id);
  return oppositeLines[lineIndex] ?? null;
}

function createChangedSegments(text: string, counterpartText?: string): InlineSegment[] {
  const displayText = text.length > 0 ? text : " ";
  if (counterpartText === undefined) {
    return [{ text: displayText, changed: true }];
  }

  const currentChars = Array.from(displayText);
  const counterpartChars = Array.from(counterpartText.length > 0 ? counterpartText : " ");

  let prefixLength = 0;
  while (
    prefixLength < currentChars.length &&
    prefixLength < counterpartChars.length &&
    currentChars[prefixLength] === counterpartChars[prefixLength]
  ) {
    prefixLength++;
  }

  let suffixLength = 0;
  while (
    suffixLength < currentChars.length - prefixLength &&
    suffixLength < counterpartChars.length - prefixLength &&
    currentChars[currentChars.length - 1 - suffixLength] ===
      counterpartChars[counterpartChars.length - 1 - suffixLength]
  ) {
    suffixLength++;
  }

  const segments: InlineSegment[] = [];
  const prefix = currentChars.slice(0, prefixLength).join("");
  const changed = currentChars
    .slice(prefixLength, currentChars.length - suffixLength)
    .join("");
  const suffix = suffixLength > 0
    ? currentChars.slice(currentChars.length - suffixLength).join("")
    : "";

  if (prefix) segments.push({ text: prefix, changed: false });
  if (changed) segments.push({ text: changed, changed: true });
  if (suffix) segments.push({ text: suffix, changed: false });

  return segments.length > 0 ? segments : [{ text: displayText, changed: false }];
}

function getLineSegments(line: ChangeLine): InlineSegment[] {
  if (!shouldShowInlineChange(line)) {
    return [{ text: line.text || " ", changed: false }];
  }

  const counterpart = getCounterpartLine(line);
  return createChangedSegments(line.text, counterpart?.text);
}

function isFirstVisibleBlockLine(lineId: string, blockId?: string): boolean {
  if (!blockId) return false;
  const firstVisibleLine = props.session.lines.find(
    (line) => line.blockId === blockId && !isHiddenByDecision(line)
  );
  return firstVisibleLine?.id === lineId;
}

function getDecisionLabel(blockId?: string): string {
  const decision = getBlockDecision(blockId);
  if (decision === "accept") return "Accepted";
  if (decision === "keep") return "Kept original";
  return "Pending";
}

function isComparingBlock(blockId?: string): boolean {
  return !!blockId && comparingBlockIds.value.has(blockId);
}

function toggleCompareBlock(blockId: string) {
  const next = new Set(comparingBlockIds.value);
  if (next.has(blockId)) {
    next.delete(blockId);
  } else {
    next.add(blockId);
  }
  comparingBlockIds.value = next;
}
</script>

<template>
  <div class="change-review">
    <div class="review-toolbar">
      <div class="review-title">
        <strong>Reviewing external changes</strong>
        <span class="review-file">{{ fileName }}</span>
        <span class="review-counts">
          {{ counts.additions }} additions, {{ counts.deletions }} deletions
        </span>
      </div>
      <div class="review-actions">
        <button class="review-btn primary" @click="emit('acceptAll')">Accept All</button>
        <button class="review-btn" @click="emit('keepMine')">Keep Mine</button>
        <button class="review-btn" @click="emit('saveBoth')">Save Both</button>
        <button class="review-btn" @click="emit('copyDiff')">Copy Diff</button>
        <button
          class="review-btn primary"
          :disabled="hasPending"
          :title="hasPending ? 'Review all change blocks before finishing' : 'Apply reviewed content'"
          @click="emit('done')"
        >
          Done
        </button>
        <button class="review-btn" @click="emit('exit')">Exit</button>
      </div>
    </div>

    <div v-if="hasPending" class="review-hint">
      Accept or keep each highlighted change block, then click Done.
    </div>

    <div class="review-body">
      <template v-for="line in session.lines" :key="line.id">
        <div
          v-if="!isHiddenByDecision(line) && isFirstVisibleBlockLine(line.id, line.blockId)"
          class="block-actions-row"
        >
          <div class="block-status">
            <span
              class="block-label"
              :class="'decision-label-' + getBlockDecision(line.blockId)"
            >
              {{ getDecisionLabel(line.blockId) }}
            </span>
            <span
              v-if="getBlockDecision(line.blockId) !== 'pending'"
              class="block-mode"
            >
              {{ isComparingBlock(line.blockId) ? 'comparing versions' : 'showing selected version' }}
            </span>
          </div>
          <div class="block-buttons">
            <button
              v-if="getBlockDecision(line.blockId) !== 'pending'"
              class="block-btn compare"
              @click="toggleCompareBlock(line.blockId!)"
            >
              {{ isComparingBlock(line.blockId) ? 'Preview' : 'Compare' }}
            </button>
            <button
              v-if="getBlockDecision(line.blockId) !== 'accept'"
              class="block-btn accept"
              @click="emit('acceptBlock', line.blockId!)"
            >
              Accept change
            </button>
            <button
              v-if="getBlockDecision(line.blockId) !== 'keep'"
              class="block-btn keep"
              @click="emit('keepBlock', line.blockId!)"
            >
              Keep original
            </button>
          </div>
        </div>
        <div
          v-if="!isHiddenByDecision(line)"
          class="review-line"
          :class="[
            'line-' + line.type,
            line.blockId ? 'decision-' + getBlockDecision(line.blockId) : '',
            isSelectedResultLine(line) ? 'line-selected-result' : '',
          ]"
        >
          <span class="line-marker">
            <template v-if="isSelectedResultLine(line)">&nbsp;</template>
            <template v-else-if="line.type === 'added'">+</template>
            <template v-else-if="line.type === 'removed'">-</template>
            <template v-else>&nbsp;</template>
          </span>
          <span class="line-number">
            {{ line.type === 'added' ? line.newLine : line.oldLine }}
          </span>
          <code class="line-text">
            <span
              v-for="(segment, index) in getLineSegments(line)"
              :key="index"
              :class="{ 'inline-change': segment.changed }"
            >{{ segment.text }}</span>
          </code>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.change-review {
  flex: 1;
  display: flex;
  min-height: 0;
  flex-direction: column;
  background: #ffffff;
}

.review-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.review-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #374151;
}

.review-file {
  overflow: hidden;
  max-width: 260px;
  color: #6b7280;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-counts {
  color: #6b7280;
}

.review-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
}

.review-btn,
.block-btn {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
}

.review-btn {
  padding: 4px 10px;
}

.review-btn:hover,
.block-btn:hover {
  background: #f3f4f6;
}

.review-btn.primary {
  border-color: #7c3aed;
  background: #7c3aed;
  color: #ffffff;
}

.review-btn.primary:hover {
  background: #6d28d9;
}

.review-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.review-hint {
  padding: 6px 12px;
  border-bottom: 1px solid #fde68a;
  background: #fffbeb;
  color: #92400e;
  font-size: 12px;
}

.review-body {
  flex: 1;
  overflow: auto;
  padding: 12px 0;
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace;
  font-size: 13px;
  line-height: 1.55;
}

.review-line {
  position: relative;
  display: grid;
  grid-template-columns: 24px 56px minmax(0, 1fr);
  min-height: 24px;
  padding: 0 16px;
  white-space: pre-wrap;
}

.line-context {
  color: #374151;
}

.line-added {
  background: #dcfce7;
  color: #14532d;
}

.line-removed {
  background: #fee2e2;
  color: #7f1d1d;
}

.decision-accept {
  box-shadow: inset 3px 0 0 #16a34a;
}

.decision-keep {
  box-shadow: inset 3px 0 0 #6b7280;
}

.decision-accept.line-added,
.decision-keep.line-removed {
  box-shadow: inset 3px 0 0 #2563eb;
}

.line-selected-result {
  background: #eff6ff;
  color: #1f2937;
  box-shadow: inset 3px 0 0 #2563eb;
}

.line-marker {
  font-weight: 700;
  user-select: none;
}

.line-number {
  color: #9ca3af;
  text-align: right;
  user-select: none;
}

.line-text {
  padding-left: 16px;
  background: transparent;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.inline-change {
  border-radius: 2px;
  font-weight: 500;
}

.line-added .inline-change {
  background: rgba(34, 197, 94, 0.18);
  color: #166534;
}

.line-removed .inline-change {
  background: rgba(239, 68, 68, 0.16);
  color: #991b1b;
}

.block-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
  padding: 4px 16px 4px 96px;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.block-status,
.block-buttons {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
}

.block-buttons {
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.block-label {
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #4b5563;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 10px;
  text-transform: capitalize;
}

.decision-label-accept {
  border: 1px solid #bbf7d0;
  background: #dcfce7;
  color: #166534;
}

.decision-label-keep {
  border: 1px solid #fecaca;
  background: #fee2e2;
  color: #991b1b;
}

.decision-label-pending {
  border: 1px solid #fde68a;
  background: #fffbeb;
  color: #92400e;
}

.block-mode {
  color: #6b7280;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 10px;
}

.block-btn {
  padding: 2px 8px;
}

.block-btn.accept {
  border-color: #16a34a;
  color: #166534;
}

.block-btn.keep {
  border-color: #6b7280;
  color: #374151;
}

.block-btn.compare {
  border-color: #2563eb;
  color: #1d4ed8;
}
</style>
