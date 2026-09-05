# AGENTS.md

## 组件文档

- 组件文档统一参照 `packages/ui/src/button/index.md` 的结构和交互形式。
- 组件文档 frontmatter 使用 `componentDoc: true` 和 `toc: false`，通过 `component-doc-intro` 写介绍，并提供一个 `overview.tsx` 作为“组件预览”。
- 所有公开用法都要写出可运行示例。至少覆盖基础用法、每个视觉变体、尺寸/布局、交互状态、禁用/加载/错误边界、组合组件和主题/语义样式；组件实际没有的类别不需要虚构示例。
- 每种用法放在 `__fixtures__/examples/*.tsx`，文件必须包含 `@title` 和 `@description`。`overview.tsx` 只负责按分类组合这些示例，避免在 MDX 中维护第二份实现。
- Markdown 的“代码演示”按功能逐项使用 `<code src="..." title="..." description="..."></code>` 引用 fixture；不要只放一段无法运行的代码来代替交互示例。
- API 文档必须说明公开类型、Props、默认值、行为边界、继承的 React Native Props、无障碍语义、`style`/`styles` 作用范围、主题 token 和明确不支持的 API。Compound component 的 Group/API 要单独说明。
- 示例应真实反映当前导出的 API，并展示状态变化或结果；新增 fixture 后同步更新文档的 `overview`、代码演示和 `docs/tsconfig.json`。
- 组件文档完成后至少运行 UI 包 typecheck、相关测试和 `docs:build`，并保持源码、fixture、文档三者的单一来源。
