<script setup lang="ts">
import { useTabStore } from "../../stores/tabStore";
import TabItem from "./TabItem.vue";

const tabStore = useTabStore();
</script>

<template>
  <div class="tab-bar">
    <div class="tabs-scroll">
      <TabItem
        v-for="tab in tabStore.tabs"
        :key="tab.id"
        :tab="tab"
        :active="tab.id === tabStore.activeTabId"
        @select="tabStore.setActiveTab(tab.id)"
        @close="tabStore.closeTab(tab.id)"
      />
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  align-items: center;
  height: 36px;
  min-height: 36px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  overflow: hidden;
}

.tabs-scroll {
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
}

.tabs-scroll::-webkit-scrollbar {
  height: 0;
}
</style>
