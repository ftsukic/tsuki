---
name: create-component
description: 创建新的 Tsuki 公共 React Native 组件或组件族时使用，包括 API 设计、实现、Fixture、文档、测试和验证。
---

# 创建组件 Skill

该 Skill 用于真正新增 public component 或 component family。编辑前读取适用的 Rule；Rule 定义约束，本 Skill 只定义执行顺序。

1. 读取相似的 source component、component barrel、`src/index.ts`、聚焦测试、Fixture 和文档，确认确实需要新增 public component。
2. 在实现前明确 public API、state ownership、React Native prop inheritance、accessibility behavior、compound API、theme/style contract 和 dependency direction。
3. 规划最小的 component directory，并将每个文件归类为 component、type、style、token、Hook 或 private domain helper。
4. 实现 component 和 support file。新命名遵循 `component-structure`，保持 private helper 为 private；只有 component 确实需要可配置 visual variable 时才创建 token support。
5. 添加 component barrel export；只有存在清晰、稳定的公共用途时才添加 root export。不要为了复用而 export private implementation。
6. 当 component 属于 documented usage surface 时，添加 canonical Fixture 和 public documentation。组件文档与 Expo Example 复用 Fixture，不要维护第二份 demo。
7. 添加聚焦的 behavior test，不暴露 internal。
8. 使用 `verify-change` 选择并运行验证，准确记录实际运行的内容，并单独报告 baseline 或 environment failure。

相关 Rule：`architecture`、`component-structure`、`api-design`、`theme-style`、`docs-fixtures`、`testing`；可能影响 release 时还要读取 `release`。
