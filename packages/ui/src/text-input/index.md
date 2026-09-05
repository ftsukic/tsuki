---
title: TextInput
nav:
  title: 组件
group:
  title: 表单组件
  order: 2
---

# TextInput

<code src="./__fixtures__/basic.tsx"></code>

`TextInput` 保留 React Native 的组件名称和输入事件，同时使用 Vant Mobile 的 token 和布局。

```text
import { TextInput } from '@ftsukic/react-native-ui';

<TextInput
  type="textarea"
  size="normal"
  rows={4}
  bordered
  clearable
  showWordLimit
  maxLength={200}
  placeholder="请输入内容"
  onChangeText={setValue}
/>;
```

支持 `type: text | textarea`、`size: large | normal | small`、`bordered`、`clearable`、`clearTrigger`、`formatter`、`formatTrigger`、`showWordLimit`、`rows`、`prefix`、`suffix`、`addonBefore` 和 `addonAfter`。

组件继承原生 `TextInputProps`，使用原生 `onChange` 和 `onChangeText`。`formatter` 在 `formatTrigger="onChangeText"` 时把格式化后的值传给 `onChangeText`；设置为 `onEndEditing` 时在结束编辑时格式化。

Semantic slots：

```text
<TextInput
  styles={{
    root: { marginHorizontal: 16 },
    input: { fontSize: 16 },
    clear: { backgroundColor: '#eee' },
    wordLimit: { color: '#999' },
  }}
/>
```

`style` 只覆盖 root；输入框自身使用 `styles.input`。不再提供旧的 `theme`、`textStyle`、`containerStyle` 等分散覆盖入口。组件不主动设置 `allowFontScaling`，保留 React Native 原生默认行为。
