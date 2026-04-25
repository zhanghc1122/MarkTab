# MarkTab 功能清单

> 基于 2025 年竞品分析和用户痛点研究，最后更新：2026-04-25

## 已完成功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| Agent 修改自动刷新 | 最高 | 非 dirty tab 静默刷新，dirty tab 弹 banner 让用户选择 |
| 粘贴/拖拽图片自动保存 | 最高 | 图片保存到 `{文件名}.assets/` 目录，自动插入 markdown 引用 |
| 打开文件夹目录树 | 高 | 支持递归子目录展开，目录排在文件前，按名称/时间排序 |
| 删除冗余功能 | 高 | 移除 `open_default_apps_settings`、Session、Skills 功能及 3 个未使用依赖 |

## 待开发功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 全文搜索 | 中 | 跨文件搜索，支持正则和过滤，结果高亮定位 |
| 文件内查找替换 | 中 | Ctrl+F 查找，Ctrl+H 替换，支持正则/大小写/全词匹配 |
| Markdown 快捷输入 | 中 | `/` 命令面板，输入 `/h1` `/table` `/code` 等快速插入模板 |
| 暗色主题 | 中 | 编辑器 + 预览 + 侧边栏全暗色，跟随系统或手动切换 |
| 导出为 PDF/HTML | 低 | 将当前 markdown 导出为 PDF 或独立 HTML 文件 |
| 多标签拖拽排序 | 低 | 拖拽标签页调整顺序 |
| 分屏编辑 | 低 | 左右分屏，同时编辑/预览不同文件 |

## 已移除功能

| 功能 | 移除原因 |
|------|----------|
| Session 浏览器 | 仅 Claude Code CLI 用户需要，Windows-only，偏离核心定位 |
| Skills 浏览器 | 仅 Claude Code 用户有内容，只读无操作，偏离核心定位 |
| Set as Default App | `open_default_apps_settings` Rust 命令，功能不可靠 |
| `@codemirror/theme-one-dark` | 未使用的依赖 |
| `vue-codemirror` | 未使用，直接用 @codemirror/view |
| `@tauri-apps/plugin-process` | 未使用的依赖 |

## 现有核心功能

- Tabbed editing — 多标签页编辑
- Live preview — 实时预览 + 语法高亮
- Table of Contents — 自动生成目录，跟随滚动
- Diagram support — Mermaid 和 draw.io 图表内联渲染，点击放大
- Directory tree — 收藏/最近文件夹，统一排序
- Auto save — 防抖保存，可配置延迟
- File watcher — 检测外部修改和删除
- Image paste — 粘贴/拖拽图片，自动保存到 .assets 目录
- Keyboard shortcuts — Ctrl+O/W/S/Tab 等快捷键
- Windows file association — 双击 .md 文件打开
