---
name: document-component
description: 添加或更新规范组件 Fixture、公共组件文档、Dumi demo 或共享 Expo Example 时使用。
---

# 文档组件 Skill

该 Skill 用于 component Fixture 或 public component documentation。编辑前读取 `docs-fixtures` 和其他适用的 Rule。

1. 读取实际 component implementation、public type、component barrel、root export、聚焦测试、theme/style usage 和现有文档。
2. 判断 component 是否属于 public documented usage surface。不要仅因为存在 Fixture directory 就创建文档；只有任务要求时才改变 documentation coverage。
3. 检查 canonical Fixture directory 和 Fixture catalog convention。尽可能复用现有 example，只在需要时于 `__fixtures__/examples/` 下添加缺失的 runnable scenario。
4. 保持 `overview.tsx` 为组合层，让 Dumi Markdown demo 指向 canonical Fixture。不要在 MDX 中维护第二份 demo implementation。
5. 记录真实 API：type、prop、default、behavior boundary、继承的 React Native prop、accessibility、style/semantic slot、token、不支持的 API，以及适用时的 compound API。
6. 只有 TypeScript input range 发生变化时才修改 `docs/tsconfig.json`；单独添加 Fixture 不是修改它的理由。
7. 使用 `verify-change` 选择 docs/example validation，并准确记录实际运行的内容。

相关 Rule：`docs-fixtures`、`api-design`、`theme-style`、`architecture`；如果改变 behavior assertion，还要读取 `testing`。
