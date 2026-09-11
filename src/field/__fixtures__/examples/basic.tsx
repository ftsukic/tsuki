import { useState } from 'react'
import { Cell, Text } from '../../..'

/**
 * @title Custom form item
 * @description 自定义表单项直接组合 Cell 和 control，不依赖通用 Field。
 */
export default function FieldBasicFixture() {
  const [city, setCity] = useState('上海')

  return (
    <Cell
      title="自定义项"
      value={<Text>{city}</Text>}
      valueExtra={<Text type="secondary">必填</Text>}
      isLink
      onPress={() => setCity(city === '上海' ? '北京' : '上海')}
    />
  )
}
