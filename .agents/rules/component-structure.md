# 组件结构 Rule

## 命名规则的适用范围

- 这些命名规则主要约束新文件和新代码。
- 修改已有 component 时，只修正与当前任务直接相关的明显不一致。不要批量重命名无关文件，也不要重写已建立的 component layout。
- 已有的 `interface.ts` 是有效的历史结构，应保留；新 component 优先使用 `types.ts`。本 Rule 不要求将 `interface.ts` 迁移为 `types.ts`。
- 已有的 PascalCase Fixture filename 属于历史实现。相关时可以记录，但不要仅为执行本 Rule 而重命名。

## 名称

- Component directory 使用 `kebab-case`，并提供 component namespace，例如 `date-picker/`、`date-time-picker/`、`floating-panel/` 和 `image-preview/`。
- React component export 使用 `PascalCase`；函数、变量和 Hook 使用 `camelCase`；Hook 以 `use` 开头；type 和 interface 使用 `PascalCase`；module constant 使用 `UPPER_SNAKE_CASE`。
- Component source directory 及其 Fixture tree 中的新文件使用 `kebab-case`。在这些范围内不得新增 PascalCase、camelCase、snake_case、`*.types.ts`、`*.utils.ts` 或 `*.style.ts` filename。本 Rule 不定义仓库无关文件的命名。

## Component file

- Main component file 保留完整 component name：`button/button.tsx`、`date-picker/date-picker.tsx` 或 `floating-panel/floating-panel.tsx`。
- 具有明确语义的 React child 保留完整含义：`picker/picker-view.tsx`、`picker/picker-column.tsx`、`field/field-input.tsx` 或 `navbar/navbar-action.tsx`。不要将它们缩短为含义不清的 `view.tsx`、`column.tsx` 或 `action.tsx`。
- Hook file 使用 `use-<purpose>.ts` 或 `.tsx`，例如 `use-picker.ts` 或 `use-field-value.ts`。

## Support file 与 domain

- Directory-level support file 使用简短的职责名称：`types.ts`、`style.ts`、`token.ts`、`utils.ts`、`context.ts`、`state.ts`、`value.ts`、`columns.ts`、`normalize.ts`，以及适用时的 `imperative.ts` / `.tsx`。
- 同一 component family 中，一个职责只使用一种名称。新 work 优先使用 `types.ts` 和 `style.ts`；不要引入并行的 `interface.ts`/`types.ts` 或 `style.ts`/`styles.ts` 约定。已有文件不会仅为一致性而迁移。
- `utils.ts` 只放 pure function 或稳定 helper，并使用能表达行为的函数名。当 domain 已经清晰时，优先使用 `columns.ts`、`value.ts`、`state.ts` 或 `normalize.ts`，不要形成无限扩张的 utility bag。
- Domain directory 应表达真实职责，并可以使用 `columns.ts`、`value.ts`、`state.ts` 或 `normalize.ts` 等职责明确的文件。Public/internal placement 和 export boundary 遵循 `architecture.md`。

## Core 与 imperative 名称

- 只有当 `<component>-core.tsx` 是真正独立、具有稳定 contract、可以独立使用且有多个真实调用方的 React component 时才使用它。它不得只是 props/value adapter 或另一个 component 的 wrapper。
- State calculation、value conversion、column generation、normalization 和 adapter 应使用职责明确的 support file 或 `use-*.ts` Hook，而不是 `FooCore`、`FooCoreRef`、`FooCoreProps` 或 `FooCoreState`。

## 代表性目录结构

```text
src/search/
  __fixtures__/
  search.tsx
  index.ts
  types.ts
  style.ts
  token.ts

src/picker/
  __fixtures__/
  picker.tsx
  picker-view.tsx
  picker-column.tsx
  picker-toolbar.tsx
  imperative.tsx
  index.ts
  types.ts
  style.ts
  token.ts
  use-picker.ts

src/picker/date-time/
  columns.ts
  types.ts
  value.ts
```

Directory 回答“这是谁的代码”；filename 回答“它做什么”。添加文件前，先判断它是 React component 还是 directory-level support capability。
