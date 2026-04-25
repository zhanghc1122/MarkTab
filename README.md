# MarkTab

A tabbed Markdown editor for Windows, built with Tauri v2 + Vue 3.

## Features

- Tabbed editing — open multiple Markdown files in tabs
- Live preview — edit and preview with syntax highlighting
- Table of Contents — auto-generated TOC with scroll-follow
- Diagram support — Mermaid and draw.io diagrams rendered inline, with click-to-zoom modal
- Directory tree — favorite and recent folders with unified sort (by name or modification time)
- Auto save — debounced save on edit, configurable delay
- File watcher — detects external changes and deletion
- Claude Code integration — browse sessions and skills from the sidebar
- Check for updates — auto-check on startup, manual check in About dialog
- Keyboard shortcuts — Ctrl+O open, Ctrl+W close tab, Ctrl+S save, Ctrl+Tab switch tab
- Windows file association — double-click .md files to open in MarkTab

## Download

[Latest Release](https://github.com/zhanghc1122/MarkTab/releases/latest)

| File | Description |
|------|-------------|
| `marktab.exe` | Standalone executable, no installer needed (~15 MB) |
| `MarkTab_x64_en-US.msi` | Windows installer (~6 MB) |

**Requirements:** Windows 10/11 x64

## Install

### MSI Installer

1. Download the latest `.msi` from [Releases](https://github.com/zhanghc1122/MarkTab/releases/latest)
2. Double-click to install
3. Launch from Start Menu or desktop shortcut

### Portable

1. Download `marktab.exe` from [Releases](https://github.com/zhanghc1122/MarkTab/releases/latest)
2. Place anywhere on your system
3. Double-click to run (no dependencies)

## Usage

- **Open file:** Ctrl+O or click the open button in the sidebar
- **Close tab:** Ctrl+W or click the X on the tab
- **Save:** Ctrl+S (auto-save is on by default)
- **Switch tabs:** Ctrl+Tab / Ctrl+Shift+Tab
- **Toggle preview:** Click the preview toggle in the tab bar
- **Add folder to favorites:** Click the folder+ button in the Quick Access toolbar
- **Sort files:** Use the sort buttons (name A-Z or time newest-first) in the toolbar
- **Zoom diagram:** Click any Mermaid or draw.io diagram to open in a zoomable modal
- **Check for updates:** Click About → Check for Updates

## License

MIT