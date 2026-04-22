# Plan: 移除分组功能

## 概述
去掉侧边栏的分组（Group）功能，所有文件平铺显示在文件树中。

## 变更清单

### 1. 类型定义
- **`src/types/file.ts`**: 删除 `FileGroup` 接口；从 `FileEntry` 中移除 `groupId` 字段
- **`src/types/config.ts`**: 从 `AppConfig` 中移除 `groups` 字段；从 `DEFAULT_CONFIG` 中移除 `groups: []`

### 2. Store 层
- **`src/stores/fileStore.ts`**:
  - 移除 `FileGroup` 导入
  - 移除 `groups` ref
  - 移除 `ungroupedFiles` computed（改为直接暴露 `files` 或用 `sortedFiles` computed）
  - 移除函数: `getGroupFiles`, `assignGroup`, `createGroup`, `deleteGroup`, `renameGroup`, `toggleGroupCollapse`
  - `addFile()`: 移除 `groupId` 参数
  - `persistState()`: 移除 `groups` 持久化
  - `loadFromConfig()`: 移除 `fileGroups` 参数

### 3. 组件
- **删除** `src/components/sidebar/GroupNode.vue`
- **`src/components/sidebar/FileTree.vue`**: 移除 GroupNode 导入和渲染，直接渲染所有文件（平铺列表）
- **`src/components/sidebar/SidebarToolbar.vue`**: 移除 "New Group" 按钮和 `handleNewGroup` 函数
- **`src/components/layout/AppLayout.vue`**: `loadFromConfig` 调用移除第二个参数

### 4. 不需要改动的文件
- `configService.ts` — 无 group 专属逻辑，`groups` 字段随 `AppConfig` 自动处理
- `appConfigStore.ts` — 同上，`groups` 作为 `config` 的一部分透明传递
- `FileTreeItem.vue`, `Sidebar.vue`, 所有 composables — 无 group 引用
