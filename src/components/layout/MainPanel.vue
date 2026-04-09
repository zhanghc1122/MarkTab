<script setup lang="ts">
import { useTabStore } from "../../stores/tabStore";
import TabBar from "../editor/TabBar.vue";
import EditorPane from "../editor/EditorPane.vue";
import EmptyState from "../editor/EmptyState.vue";

const tabStore = useTabStore();
</script>

<template>
  <main class="main-panel">
    <TabBar v-if="tabStore.tabs.length > 0" />
    <EditorPane v-if="tabStore.activeTab" />
    <EmptyState v-else />
  </main>
</template>

<style scoped>
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
}
</style>
