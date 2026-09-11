import { Field, Text } from '../../..'

/**
 * @title Field selector
 * @description 自定义 selector 只负责自己的 value 展示，Field 负责 Item 布局和点击语义。
 */
export default function FieldSelectorFixture() {
  return (
    <Field label="城市" value="上海" isLink onPress={() => undefined}>
      {({ value }) => <Text>{value || '请选择'}</Text>}
    </Field>
  )
}
