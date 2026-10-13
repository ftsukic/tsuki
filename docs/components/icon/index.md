---
title: Icon
componentDoc: true
toc: false
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

传入 `onPress` 时，组件使用 Pressable 根容器。`touchableSize` 默认为 `44`，通过 `hitSlop` 扩展点击范围，不改变图标布局尺寸；显式传入 `hitSlop` 时优先使用该值。单独传入 `touchableSize` 不会启用交互。

无障碍属性作用于根容器；`style` 设置根容器样式，`svgStyle` 设置内部 SVG 样式。`color` 支持 React Native 的字符串颜色、`PlatformColor` 和 `DynamicColorIOS`。自定义图标的子节点遵循 SVG 的 `fill` 和 `stroke` 继承。

组件入口只导出 `Icon`、`IconProps`、`IconName`。自定义图标定义从 `@ant-design/icons-svg` 直接导入；底层渲染组件和图标映射不作为公共 API。
