# 文档与 Fixture Rule

## Canonical examples

- `src/<component>/__fixtures__/` 是 canonical example source。组件文档和 Expo Example 应复用同一份 Fixture，不要维护分离的 demo implementation。
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
- Public component 文档使用普通 Markdown 介绍 component，并链接到相应的 canonical Fixture source。
- 文档中的示例链接应使用真实存在的 Fixture 文件。不要维护第二份 demo implementation。
- 文档必须描述实际的 public type、prop、default、behavior boundary、继承的 React Native prop、accessibility semantic、`style`/`styles` scope、theme token、不支持的 API，以及适用时的 compound API。
- 覆盖适用的 public use case：basic usage、visual variant、size/layout、interaction state、disabled/loading/error boundary、compound component，以及 theme 或 semantic styles。不要虚构 component 没有实现的类别。
- Example 必须反映当前 export 的 API，并展示有意义的 state 或 result change。保持 source、Fixture 和 docs contract 一致。

## 仓库特定边界

- 除非任务明确要求改变 documentation coverage，否则不要为了强制 Fixture 与 documentation 一一对应而新增或删除现有 coverage。
- Fixture catalog generator 定义 Expo Example 的发现方式。单独新增 Fixture 不要求修改 TypeScript configuration。
- Validation step 属于 `verify-change`，不属于本 Rule。没有实际运行对应命令时，不要声称 docs 或 Fixture 已验证。
