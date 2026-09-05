---
title: 仓库架构
order: 2
---

# 仓库架构

```text
packages/ui/
  真实组件源码、同目录 Markdown 文档和 __fixtures__

apps/docs/
  dumi 文档站、dumi-theme-mobile 和 React Native Web alias

packages/dumi-theme-rn-snack/
  未来的 Snack 主题占位，当前未接入

examples/snack/
  未来的 Snack 示例约定，当前不参与文档运行
```

组件源码和文档 demo 保持单一来源：每个组件目录的 `index.md` 描述 API，`__fixtures__/*.tsx` 提供 H5 交互示例，不在 Markdown 中复制第二份组件实现。

文档当前使用 `react-native-web` 进行 H5 预览，不能替代 iOS、Android 或 HarmonyOS Native Runtime 验证。
