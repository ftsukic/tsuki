import { useState } from 'react'
import { Field, Text } from '../../..'

/**
 * @title Basic custom Field
 * @description Field 只负责 Cell-based Form Item shell，children 自己渲染 control。
 */
export default function FieldBasicFixture() {
  const [city, setCity] = useState('上海')

  return (
    <Field
      label="城市"
      value={city}
      onChange={setCity}
      valueExtra={<Text type="secondary">必填</Text>}
      isLink
      onPress={() => setCity(city === '上海' ? '北京' : '上海')}
      description="点击整行切换自定义 control 的值"
    >
      {({ value }) => <Text>{value}</Text>}
    </Field>
  )
}
