---
title: Button
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Button

<code src="./__fixtures__/variants.tsx"></code>

Button 用于触发操作，支持常用的类型、尺寸、加载和按压状态。

```text
import { Button } from '@ftsukic/react-native-ui';

<Button type="primary" size="large" block round onPress={save}>
  保存
</Button>;
```

支持的类型和尺寸：

```text
type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger';
type ButtonSize = 'large' | 'normal' | 'small' | 'mini';
```

Props 还包括 `color`、`plain`、`block`、`round`、`square`、`circle`、`hairline`、`disabled`、`loading`、`loadingText`、`icon`、`iconPosition`、`style` 和 `onPressDebounceWait`。组件继承 React Native `PressableProps`，`style` 始终是 root 样式。

`square` 仅将按钮的 `borderRadius` 设置为 `0`，不会改变按钮的内容宽度或水平内边距。`circle` 会使用当前 `size` 对应的正方形尺寸并裁剪为圆形，适合搭配 `icon` 使用；纯图标按钮应提供 `accessibilityLabel`。

Semantic slots：

```text
<Button
  styles={({ state }) => ({
    root: { marginTop: state.pressed ? 2 : 0 },
    icon: { marginRight: 8 },
    content: { fontWeight: '600' },
  })}
>
  继续
</Button>
```

`styles` 可以是对象或函数，函数可读取 `props` 和 `state.pressed / disabled / loading`。`loading` 会禁用 press，并用 `LoadingIcon` 渲染加载状态。首轮不保留 `danger`、`ghost`、`link`、`text`、`textColor`、`textStyle` 等旧 API。
