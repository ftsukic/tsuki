---
title: Radio 单选框
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Radio 单选框

<code src="./__fixtures__/basic.tsx"></code>

Radio 用于从一组选项中选择一个值，也可以单独作为可控的布尔选择项使用。

## 引入

```tsx | pure
import { Radio } from '@ftsukic/react-native-ui'
```

## 基础用法

```tsx | pure
<Radio checked={checked} onChange={setChecked}>
  接收通知
</Radio>
```

## Radio.Group

Group 支持受控和非受控模式。子 Radio 适合自定义标签；`options` 适合简单配置。两者只能选择一种声明方式。

```tsx | pure
<Radio.Group value={value} onChange={setValue}>
  <Radio value="apple">Apple</Radio>
  <Radio value="banana">Banana</Radio>
</Radio.Group>

<Radio.Group
  defaultValue={1}
  direction="horizontal"
  options={[
    { value: 1, label: '男' },
    { value: 2, label: '女' },
  ]}
/>
```

## API

| 属性           | 类型                         | 默认值    | 说明                                |
| -------------- | ---------------------------- | --------- | ----------------------------------- |
| value          | `string \| number`           | —         | Group 中的选项值                    |
| checked        | `boolean`                    | `false`   | standalone Radio 的受控选中状态     |
| defaultChecked | `boolean`                    | `false`   | standalone Radio 的初始选中状态     |
| disabled       | `boolean`                    | `false`   | 禁用选择                            |
| shape          | `'round' \| 'square'`        | `'round'` | 指示器形状                          |
| labelPosition  | `'left' \| 'right'`          | `'right'` | 标签位置                            |
| checkedColor   | `ColorValue`                 | 主题主色  | 选中颜色                            |
| onChange       | `(checked: boolean) => void` | —         | standalone 状态改变时触发           |
| styles         | `RadioStyles`                | —         | `root / indicator / label` 语义样式 |

`Radio.Group` 额外支持 `value`、`defaultValue`、`onChange(value)`、`options`、`disabled`、`direction` 和 `gap`。Group 是单选行为，选中项不能通过再次点击取消；Group 的 `disabled` 会覆盖子 Radio 的启用设置。

Radio 暴露 `radio` 无障碍角色和 `selected`、`disabled` 状态；Group 暴露 `radiogroup` 角色。
