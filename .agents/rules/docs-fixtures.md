# 文档与 Fixture Rule

## Canonical examples

- `src/<component>/__fixtures__/` 是 canonical example source。Dumi 和 Expo Example 应复用同一份 Fixture，不要维护分离的 demo implementation。
- 通常使用以下结构：

  ```text
  __fixtures__/
    overview.tsx
    examples/
      *.tsx
  ```

- 每个 example file 都包含 `@title` 和 `@description`。`overview.tsx` 按 category 组合 examples，不承担第二份 demo implementation。
- 一个 Fixture set 使用 `overview.tsx` 加上 `examples/` 下一个或多个 runnable file，并遵循 Fixture catalog generator 的要求。
- 新 Fixture filename 描述 scenario，并使用 component directory 作为 namespace，例如 `basic.tsx`、`controlled.tsx`、`bounds.tsx` 或 `formatter.tsx`。已有 PascalCase Fixture filename 属于历史实现，应保持不变。
- Fixture 与 component documentation 不要求一一对应。只有属于 public documented usage surface 的 component 才要求存在 `docs/components/<component>/index.md`。

## Component documentation

- 使用 `docs/components/button/index.md` 作为结构参考，不要将不存在的章节机械套用到其他 component。
- Public component 文档通常使用 `componentDoc: true` 和 `toc: false`，通过 `component-doc-intro` 介绍 component，并在该 component 属于 Dumi component-doc system 时提供 `overview.tsx` preview。
- Markdown demo 使用每项一个 `<code src="..." title="..." description="..."></code>` 引用 runnable Fixture。不要用未运行的 code block 替代 interactive example，也不要在 MDX 中维护第二份 demo implementation。
- 文档必须描述实际的 public type、prop、default、behavior boundary、继承的 React Native prop、accessibility semantic、`style`/`styles` scope、theme token、不支持的 API，以及适用时的 compound API。
- 覆盖适用的 public use case：basic usage、visual variant、size/layout、interaction state、disabled/loading/error boundary、compound component，以及 theme 或 semantic styles。不要虚构 component 没有实现的类别。
- Example 必须反映当前 export 的 API，并展示有意义的 state 或 result change。保持 source、Fixture 和 docs contract 一致。

## 仓库特定边界

- 除非任务明确要求改变 documentation coverage，否则不要为了强制 Fixture 与 documentation 一一对应而新增或删除现有 coverage。
- Fixture catalog generator 和当前 TypeScript configuration 定义 example 的发现方式。单独新增 Fixture 不要求修改 `docs/tsconfig.json`；只有 TypeScript input range 发生变化时才调整配置。
- Validation step 属于 `verify-change`，不属于本 Rule。没有实际运行对应命令时，不要声称 docs 或 Fixture 已验证。
