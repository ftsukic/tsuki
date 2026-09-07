---
title: LoadingIcon
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# LoadingIcon

<code src="./__fixtures__/basic.tsx"></code>

`LoadingIcon` 基于 `Icon` 和 React Native `Animated` 实现旋转加载指示器。

```text
import { LoadingIcon } from '@ftsukic/react-native-ui';

<LoadingIcon size={20} color="#1989FA" duration={900} />;
```

Props：

- `size`：图标尺寸，必填。
- `color`：图标颜色，必填。
- `duration`：完成一圈旋转的毫秒数，必填。
- `active`：是否运行旋转动画，默认为 `true`。

组件还继承 React Native `ViewProps`。Native Runtime 中由原生动画驱动；H5 文档用于检查布局和交互外观。
