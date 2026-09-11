import { useState } from 'react'
import { FieldRadio } from '../../..'
import type { RadioValue } from '../../..'

/**
 * @title FieldRadio
 * @description FieldRadio 直接暴露 Radio.Group 的 options、direction 和 gap。
 */
export default function FieldRadioFixture() {
  const [value, setValue] = useState<RadioValue>('small')

  return (
    <FieldRadio
      label="尺寸"
      value={value}
      onChange={setValue}
      options={[
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' },
      ]}
      direction="horizontal"
      gap={16}
      status="warning"
      description="请选择一个尺寸"
    />
  )
}
