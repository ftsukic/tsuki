# React Native UI 文档

这是 `@ftsukic/react-native-ui` 的 dumi 文档站。

```bash
yarn docs:dev
```

文档使用 `dumi-theme-mobile`，并通过 `react-native-web` 和 `.umi-patch` alias 将 React Native 组件渲染为 H5 demo。组件 Markdown 和交互 fixture 位于 `packages/ui/src/<component>/` 同目录。

当前不接入 `@ftsukic/dumi-theme-rn-snack`，不会加载 Snack embed；需要原生能力时请使用 Native Runtime 验证。
