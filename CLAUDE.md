# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
# Frontend only
npm run dev          # Vite dev server on port 1420

# Type check
npm run build        # vue-tsc --noEmit && vite build

# Production build (generates exe + MSI installer)
npx tauri build

# Output locations:
#   EXE: src-tauri/target/release/marktab.exe  (~15MB, standalone, no DLL dependencies)
#   MSI: src-tauri/target/release/bundle/msi/
```

**Note:** `target/release/` 会达到 ~1.4GB，但绝大多数是 Cargo 编译缓存（deps/ 中的 .rlib/.rmeta）。分发给用户只需要 `marktab.exe`（~15MB），它是静态链接的独立可执行文件。用 `cargo clean` 可安全清理整个 target 目录（只影响下次编译速度）。

**Starting Tauri dev/build from Claude Code (bash):**

`run-dev.cmd` works in CMD but not from Claude Code's bash. Both `npx tauri dev` and `npx tauri build` require the MSVC environment to be set explicitly with **Windows-style backslash paths** for `LIB` and `INCLUDE`. Unix-style paths cause `LNK1104: msvcrt.lib not found`.

```bash
export CC="C:/Program Files/Microsoft Visual Studio/2022/Community/VC/Tools/MSVC/14.44.35207/bin/HostX64/x64/cl.exe"
export CXX="$CC"
export LIB='C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.44.35207\lib\x64;C:\Program Files (x86)\Windows Kits\10\Lib\10.0.22621.0\ucrt\x64;C:\Program Files (x86)\Windows Kits\10\Lib\10.0.22621.0\um\x64'
export INCLUDE='C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.44.35207\include;C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\ucrt;C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\um;C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0\shared'
export PATH="/c/Program Files/Microsoft Visual Studio/2022/Community/VC/Tools/MSVC/14.44.35207/bin/HostX64/x64:$PATH"
npx tauri dev   # or: npx tauri build
```

**Root cause:** VS Insiders (on D: drive) is auto-detected by `cc-rs` but lacks `msvcrt.lib`. Setting `CC`/`CXX` forces the correct VS 2022 Community toolchain. The `.cargo/config.toml` already pins the linker but that alone is insufficient.

**WiX / MSI note:** `tauri.conf.json` 中 `bundle.targets` 设为 `["msi"]`（仅生成 MSI，跳过 NSIS）。`fileAssociations` 的 `description` 必须使用 ASCII 字符，中文字符会导致 WiX `light.exe` 报错 `LGHT0311`（代码页 1252 不兼容）。

## Architecture

**MarkTab** is a tabbed Markdown editor built with Tauri v2 (Rust) + Vue 3 (TypeScript).

### State Flow

```
AppConfig (JSON in appDataDir)
  ├── recentFiles → fileStore (Pinia)
  ├── favoriteDirs, recentDirs → directoryStore (Pinia)
  └── preferences → appConfigStore (Pinia)
        ├── autoSaveDelay
        ├── sidebarWidth
        ├── editorMode
        ├── fontSize
        ├── lineWrapping
        └── lineNumbers

Active Tab Content → useAutoSave (debounced) → writeFileContent → disk

Update Check → useUpdateChecker (GitHub Releases API) → shell.open(releaseUrl) → browser
```

All stores use Pinia Composition API style. `fileStore.persistState()` serializes runtime state back through `appConfigStore` to the JSON config file. Five stores total: `appConfigStore` (preferences & config persistence), `fileStore` (file list & recent files), `tabStore` (open tabs, active tab, dirty state), `editorStore` (CodeMirror instance & editor-specific state), `directoryStore` (favorite/recent directories & directory tree).

### Code Structure

```
src/
  components/       editor/ (MarkdownEditor, MarkdownPreview, TabBar, TabItem, EditorPane, EmptyState, StatusBar, TableOfContents, FileChangeBanner)
                    layout/ (AppLayout, MainPanel, Sidebar)
                    settings/ (SettingsDialog, AboutDialog, UpdateDialog)
                    sidebar/ (FileTree, FileTreeItem, SidebarToolbar, SidebarHeader, QuickAccess, SortBar, DirNode, DirFileNode)
  composables/      useAutoSave, useExternalFileOpen, useFileDialog, useFileWatcher, useKeyboardShortcuts, useDirectoryTree, useDocumentStats, useTableOfContents, useUpdateChecker
  services/         configService (config file read/write)
                    fileIoService (file open/read/write via Tauri FS plugin)
                    markdownService (markdown-it rendering + highlight.js + mermaid + draw.io)
  stores/           appConfigStore, fileStore, tabStore, editorStore, directoryStore
  types/            config.ts, file.ts, tab.ts, directory.ts
  utils/            pathUtils.ts
```

### File Opening Paths

1. **Dialog:** Ctrl+O / toolbar button → `useFileDialog` → `fileIoService.openFileDialog()`
2. **External:** OS file association / CLI arg → Rust `single-instance` plugin → emits `"open-file"` event → `useExternalFileOpen` composable → same `readFileContent` + `addFile` + `openTab` flow
3. **File tree:** Click file in sidebar → reuses existing tab if already open

### Rust Backend

Minimal — `src-tauri/src/lib.rs` registers plugins and handles CLI argument forwarding. All file I/O uses `tauri-plugin-fs` and `tauri-plugin-dialog` from the frontend.

`lib.rs` has a `extract_file_path` helper that skips flags (`-` prefixed args) and the program name. On first launch, it sleeps 500ms before emitting `"open-file"` to let the frontend mount. `main.rs` uses `windows_subsystem = "windows"` to suppress the console window in release builds.

### Key Dependencies

- **Editor:** CodeMirror 6 (direct, not via vue-codemirror) + `@codemirror/lang-markdown`
- **Preview:** `markdown-it` + `highlight.js` + `mermaid` (diagrams) + draw.io (inline SVG)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`
- **Tauri Plugins:** `fs`, `dialog`, `shell`, `window-state`, `single-instance`

## Conventions

- UI language is English
- Vue components use `<script setup lang="ts">` (Composition API)
- TypeScript strict mode: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true` in tsconfig
- File paths use `@tauri-apps/plugin-fs` APIs (not Node.js `fs`)
- Tab dirty state: tracked by comparing `content` vs `originalContent` in `TabState` (managed by `tabStore`)
- CodeMirror extensions that may change at runtime (theme, lineWrapping, lineNumbers) use the `Compartment` pattern in `MarkdownEditor.vue` — dispatch `compartment.reconfigure()` via watchers instead of rebuilding `EditorState`
- No test framework is set up — no vitest/jest/cypress/playwright config or test files exist

## Release Workflow

### Automated (GitHub Actions)

Push a tag to trigger cross-platform builds:

```bash
# 1. Update version in package.json, Cargo.toml, Cargo.lock, tauri.conf.json

# 2. Commit and push
git add -A && git commit -m "release: vx.y.z"
git push github master

# 3. Create and push tag
git tag vx.y.z
git push github vx.y.z
```

GitHub Actions builds:
- **Windows**: EXE + MSI (`x86_64-pc-windows-msvc`)
- **macOS**: app + dmg (Intel + ARM: `x86_64-apple-darwin`, `aarch64-apple-darwin`)

Release is created as draft — manually publish after reviewing.

### Manual (Windows only)

1. **Update version number** in all four locations:
   - `package.json` — `"version": "x.y.z"`
   - `src-tauri/Cargo.toml` — `version = "x.y.z"`
   - `src-tauri/Cargo.lock` — find `name = "marktab"` entry and update its `version`
   - `src-tauri/tauri.conf.json` — `"version": "x.y.z"`

2. **Build** — `npx tauri build` (with MSVC env vars)

3. **Create GitHub Release** manually with EXE + MSI assets

## Tauri Config Notes

- Window defaults: 1100x750, minimum 700x500
- `security.csp: null` — CSP disabled intentionally (needed for markdown preview with highlight.js)
- Vite uses `strictPort: true` on port 1420 (hardcoded Tauri expectation)
- App identifier: `com.marktab.app`
