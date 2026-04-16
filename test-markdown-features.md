# MarkTab Markdown 功能测试

## 1. 标题 Heading

# H1 标题
## H2 标题
### H3 标题
#### H4 标题
##### H5 标题
###### H6 标题

---

## 2. 文本格式 Formatting

**粗体文本**（Bold）
*斜体文本*（Italic）
***粗斜体文本***
~~删除线文本~~
`行内代码`（Inline Code）

---

## 3. 列表 List

无序列表：
- 项目一
- 项目二
  - 嵌套项目
  - 嵌套项目
- 项目三

有序列表：
1. 第一项
2. 第二项
3. 第三项

---

## 4. 超链接 Link

行内链接：[GitHub](https://github.com)
自动链接（需 linkify-it）：https://github.com
引用链接：[Google][google]
[google]: https://www.google.com

---

## 5. 图片 Image

网络图片：
![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)

本地图片（相对路径）：
![本地图片](./assets/example.png)

> 注：本地图片需确保路径正确，预览模式下可正常显示。

---

## 6. 代码块 Code Block

行内代码：`const x = 10`

普通代码块：
```
function hello() {
  console.log("Hello, MarkTab!");
}
```

语法高亮代码块（JavaScript）：
```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
```

语法高亮代码块（Python）：
```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
```

语法高亮代码块（Rust）：
```rust
fn main() {
    println!("Hello, world!");
}
```

---

## 7. 表格 Table

| 功能     | 支持情况 | 备注           |
|---------|---------|----------------|
| 粗体     | ✅      | `**text**`     |
| 斜体     | ✅      | `*text*`       |
| 代码     | ✅      | `` `code` ``   |
| 链接     | ✅      | `[text](url)`  |
| 图片     | ✅      | `![alt](src)`  |
| 列表     | ✅      | `-` 或 `1.`    |
| 表格     | ✅      | `\| col \|`    |
| 代码块   | ✅      | ` ```lang `    |

---

## 8. 引用 Blockquote

> 这是一段引用文本。
>
> 可以有多行。
>
> > 嵌套引用也可以。

---

## 9. 分割线 Horizontal Rule

---
（三个短横线）

***

（三个星号）

___

（三个下划线）

---

## 10. HTML 标签（启用 html: true）

<span style="color: red;">内联红色文本</span>

<div style="background: #f0f0f0; padding: 10px; border-radius: 4px;">
  <strong>HTML 区块</strong>：使用原生 HTML 标签
</div>

---

## 11. 任务列表 Task List

- [x] 已完成的任务
- [ ] 未完成的任务
- [ ] 还有一个任务

---

## 12. 脚注 Footnote

这是一个脚注引用[^1]。

[^1]: 这是脚注的内容。

---

## 13. 自动链接 (需 linkify-it)

- https://www.google.com
- ftp://example.com
- 邮件：test@example.com

---

## 14. 特殊字符转换（typographer）

- (c) → ©
- (r) → ®
- (tm) → ™
- ... → …
- --- → —
- -- → –
- "quotes" → "quotes"
- 'quotes' → 'quotes'

---

## 15. draw.io 图表

Draw.io 图表（文件引用）：

![测试图表](./test-drawio.drawio)
