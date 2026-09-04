---
title: 仓库架构
order: 2
---

# 仓库架构

```text
packages/ui/
  真实组件源码和公开入口

packages/dumi-theme-rn-snack/
  dumi Previewer 覆盖和 Snack 适配

apps/docs/
  dumi 文档站

examples/snack/
  Snack 示例源码和后续 registry
```

组件源码、文档 demo 和 Snack 示例应保持单一来源，不在 MDX 中复制第二份组件实现。

首版不包含原生 Example App，因此文档中的 Snack 预览不能替代 iOS、Android 或 HarmonyOS runtime 验证。
