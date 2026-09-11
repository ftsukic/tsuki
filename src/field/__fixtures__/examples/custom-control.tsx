import { useState } from 'react'
import { Field, Text } from '../../..'

/**
 * @title Field custom control
 * @description 普通 ReactNode 是完全自管的 value/control slot。
 */
export default function FieldCustomControlFixture() {
  const [city, setCity] = useState('上海')

  return (
    <Field label="城市" value={city} valueAlign="right" isLink onPress={() => setCity('北京')}>
      <Text>{city}（点击整行切换）</Text>
    </Field>
  )
}
