---
title: Icon
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Icon

<code src="../../../src/icon/__fixtures__/overview.tsx"></code>

`Icon` 使用 `@ant-design/icons-svg` 图标定义，并通过 `react-native-svg` 渲染到 React Native。H5 文档预览使用 `react-native-svg` 的 Web 实现。

```text
import { Icon } from '@ftsukic/tsuki';

<Icon name="CheckOutlined" size={20} color="#07C160" />;
```

公开 Props 包括 `name`、`size`、`color`、`rotation`、`style`、`svgStyle`、`disabled`、`touchableSize`、`twoToneColor` 和 `onPress`。`name` 可以是内置 `IconName` 或自定义 `IconDefinition`。

当传入 `onPress` 或 `touchableSize` 时，组件会提供适合触摸的 Pressable 容器；仅展示图标时可以省略这些属性。
