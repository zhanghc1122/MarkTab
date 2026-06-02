# MarkTab 应用问题与鲁棒性审查清单

审查日期：2026-06-02

## 验证结果

- `npm run build` 通过，TypeScript 与 Vite 生产构建未发现阻塞性编译错误。
- Vite 构建提示多个 chunk 超过 500 KB，其中主包约 1.79 MB，`mermaid.core` 约 609 KB，存在启动与预览性能风险。
- `cargo check` 未通过，失败点在本机 MSVC/Windows SDK 环境：`windows.h` 引用 `excpt.h` 找不到。该结果暂不能直接定性为 Rust 代码错误，需要在正确的 VS Developer Command Prompt 或修复 SDK include 环境后复核。
- 当前 `package.json` 未配置测试脚本，尚无法通过自动化测试验证保存、退出、文件冲突、目录树等关键路径。

## 高优先级问题

### 1. Markdown 预览存在高权限 XSS 与本地能力放大风险

位置：

- `src/services/markdownService.ts`：`html: true`
- `src/components/editor/MarkdownPreview.vue`：`v-html="renderedHtml"`
- `src-tauri/capabilities/default.json`：fs 权限允许 `**`，并启用 `shell:allow-open`
- `src-tauri/tauri.conf.json`：`csp: null`，`assetProtocol.scope.allow: ["**"]`

风险：

应用允许 Markdown 原始 HTML 进入预览 DOM，同时 Tauri 权限开放全盘读写、文件监听和 shell open。恶意 Markdown 文件一旦被打开，攻击面很大。

建议：

- 默认禁用 Markdown 原始 HTML，或引入 DOMPurify 等白名单净化。
- 收窄 fs 权限到用户主动选择过的文件、目录或应用数据目录。
- 配置 CSP，不使用 `csp: null`。
- 收窄 asset protocol scope，避免预览任意本地路径。
- 对 shell open 增加 URL 协议白名单和确认策略。

### 2. 配置文件路径拼接疑似错误

位置：

- `src/services/configService.ts`：`return dir + CONFIG_FILE`

风险：

如果 `appDataDir()` 返回值不带尾部分隔符，配置文件路径可能变成类似 `...\AppDatamarktab-config.json` 的错误路径，导致配置读写异常或落到非预期位置。

建议：

- 使用 Tauri/JS path join API。
- 避免手写字符串拼接文件路径。
- 增加配置路径单元测试。

### 3. 退出时保存失败后仍继续关闭应用

位置：

- `src/components/layout/AppLayout.vue`：`shutdownFlow()`、`appWindow.destroy()`、`invoke("exit_app")`

风险：

`flushAutoSave()` 保存失败后只 alert 提示，随后仍会关闭窗口或退出进程。用户可能丢失仍在内存中的修改。

建议：

- 保存失败时阻止退出。
- 提供“重试保存 / 另存为 / 仍然退出”选择。
- 退出流程应返回明确状态，而不是只做 side effect。

### 4. 自动保存只有一个全局 timer

位置：

- `src/composables/useAutoSave.ts`：`let timer`
- watch 只监听 `activeTab.value?.content`

风险：

快速切换标签、多标签同时 dirty、后台标签内容状态变化时，保存调度不够稳定。单 timer 容易互相覆盖。

建议：

- 按 tab id 维护 debounce timer。
- 切换 active tab 前 flush 当前 tab。
- 对所有 dirty tab 提供可控的批量 flush。

### 5. 外部文件冲突会阻断自动保存，但退出提示不区分

位置：

- `src/composables/useAutoSave.ts`：遇到 `externallyChanged` 或 `externallyDeleted` 直接跳过保存。
- `src/components/layout/AppLayout.vue`：退出确认只提示保存修改并退出。

风险：

用户看到“Save changes and exit MarkTab?”可能认为所有 dirty 文件都会保存，但冲突文件实际会被跳过。

建议：

- 将外部冲突文件作为退出阻塞项。
- 退出前要求用户处理冲突：接受外部版本、保留本地版本、另存冲突副本。
- 在确认文案中明确列出冲突文件。

## 中优先级问题

### 6. 文件监听错误处理偏弱

位置：

- `src/composables/useFileWatcher.ts`：`fsWatch()` 返回 promise，但启动失败和 unwatch 失败没有充分处理。

风险：

watch 失败后 UI 不知道，外部修改检测会静默失效。

建议：

- 捕获 watch/unwatch 失败并显示状态。
- 对监听失败的文件标记“外部变更检测不可用”。
- 增加重试能力。

### 7. 自写入事件抑制窗口固定为 1 秒

位置：

- `src/composables/useFileWatcher.ts`：`SUPPRESSION_WINDOW_MS = 1000`

风险：

慢磁盘、同步盘、杀软扫描、多事件批处理场景下，固定窗口可能误吞真实外部修改，或让自写入事件漏出。

建议：

- 结合 mtime、文件大小或内容 hash 判断。
- 写入后记录更精确的版本 token。
- 对同一路径事件做队列化处理。

### 8. 打开文件失败缺少用户反馈

位置：

- `src/composables/useFileDialog.ts`
- `src/composables/useExternalFileOpen.ts`
- `src/composables/useDirectoryTree.ts`

风险：

多处失败只写 console，用户只会感觉操作没有反应。

建议：

- 增加统一 toast 或错误 banner。
- 对权限不足、文件不存在、编码失败分别提示。
- 将关键错误纳入可复制的诊断信息。

### 9. 最近文件状态跨会话判断基本失效

位置：

- `src/stores/fileStore.ts`：`loadFromConfig()` 清空 `diskMtime`

风险：

重启后无法判断文件是否在上次关闭后被修改。`modified` 状态依赖旧 mtime，但旧 mtime 不持久化。

建议：

- 持久化最近文件的上次已知 mtime。
- 打开文件时更新基线。
- 对跨会话变更提供明确提示。

### 10. 目录树渲染为固定层级，不是真递归

位置：

- `src/components/sidebar/DirNode.vue`

风险：

当前手写 child/subChild/deepChild 多层模板，更深层目录无法自然继续展开，维护成本高。

建议：

- 抽出递归目录节点组件。
- 将排序、展开、错误状态封装到统一节点渲染逻辑。
- 增加深层目录交互测试。

### 11. Markdown 本地图片路径和 assetProtocol 过宽

位置：

- `src/services/markdownService.ts`：`convertFileSrc(absolutePath)`
- `src-tauri/tauri.conf.json`：asset protocol allow `**`

风险：

Markdown 可引用任意本地图片路径。配合全盘 asset scope，用户文档可以探测或展示非当前文档目录的本地资源。

建议：

- 默认只允许当前 Markdown 文件所在目录及其子目录。
- 绝对路径资源加载前提示用户确认。
- 对资源路径做规范化和越界检查。

### 12. Mermaid 和 draw.io 渲染直接写入 HTML

位置：

- `src/services/markdownService.ts`
- `src/components/editor/MarkdownPreview.vue`

风险：

图表库输出或 draw.io XML 生成内容最终通过 `innerHTML` / `v-html` 注入。即使来源是库，也应按不可信内容处理。

建议：

- 对 SVG/HTML 输出做净化。
- 禁止脚本、事件属性、外链危险协议。
- diagram modal 不直接复制 `diagram.innerHTML`，而使用受控渲染结果。

## 低优先级与工程质量问题

### 13. 更新检查缺少超时与用户控制

位置：

- `src/composables/useUpdateChecker.ts`

风险：

启动时访问 GitHub。离线、网络慢、被墙或 DNS 异常时虽然 catch，但缺少超时控制和用户偏好开关。

建议：

- 使用 `AbortController` 设置超时。
- 增加“启动时检查更新”偏好设置。
- 限制检查频率，例如每天最多一次。

### 14. 包体偏大，影响启动与预览性能

证据：

- `npm run build` 输出主包约 1.79 MB。
- `mermaid.core` 约 609 KB。

建议：

- 懒加载 Markdown 预览增强能力。
- 将 Mermaid、draw.io、highlight 语言包拆分加载。
- 对常用 Markdown 编辑路径保持轻量。

### 15. 缺少自动化测试覆盖

位置：

- `package.json` 未配置 `test` 脚本。

建议优先补充：

- 配置读写与路径 join。
- 路径规范化和越界判断。
- 自动保存与多标签切换。
- 外部文件修改、删除、冲突合并。
- 退出前保存失败流程。
- 目录树深层递归。
- Markdown HTML 净化安全用例。

### 16. Rust/Tauri 检查依赖本机编译环境

现象：

`cargo check` 在 `vswhom-sys` 的 C++ 编译阶段失败，报 `excpt.h` 找不到。

建议：

- 使用 Visual Studio Developer Command Prompt 重新运行。
- 检查 MSVC 与 Windows SDK include 路径。
- 在 CI 中固定 Windows 构建环境，避免只依赖本机配置。

## 建议修复顺序

1. 处理 Markdown 安全面：禁用或净化 HTML，收窄 Tauri fs/shell/asset 权限，配置 CSP。
2. 修复配置文件路径拼接。
3. 修复退出流程：保存失败或外部冲突时阻止退出。
4. 重构自动保存与外部文件冲突处理。
5. 增强文件监听错误反馈与自写入事件判定。
6. 补齐用户可见错误提示。
7. 将目录树改为递归组件。
8. 做预览功能拆包和性能优化。
9. 补测试脚本与关键路径自动化测试。
10. 修复本机/CI Rust 构建环境后复核 Tauri 层。
