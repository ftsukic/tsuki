import { useState } from 'react'
import { FieldRadio } from '../../..'
import type { RadioValue } from '../../..'

/**
 * @title FieldRadio
 * @description FieldRadio 的 button options 使用 Grid 等宽布局，选项过多时自动换行。
 */
export default function FieldRadioFixture() {
  const [value, setValue] = useState<RadioValue>('small')

  return (
    <>
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
        buttonColumns={5}
      />
      <FieldRadio
        label="尺寸"
        value={value}
        onChange={setValue}
        required
        variant="button"
        buttonVariant="outline"
        options={[
          { value: 'small', label: '小' },
          { value: 'medium', label: '中' },
          { value: 'large', label: '大' },
          { value: 'large2', label: '巨大大' },
          { value: 'large3', label: '巨大大3' },
          { value: 'large4', label: '超大选项4' },
          { value: 'large5', label: '超大选项5' },
          { value: 'large6', label: '超大选项6' },
        ]}
        direction="horizontal"
        gap={8}
        buttonColumns={4}
        buttonLayout="equal"
      />
      <FieldRadio
        label="尺寸"
        value={value}
        onChange={setValue}
        required
        vertical
        variant="button"
        buttonVariant="outline"
        buttonLayout="equal"
        options={[
          { value: 'small', label: '小' },
          { value: 'medium', label: '中' },
          { value: 'large', label: '大' },
          { value: 'large2', label: '巨大大' },
          { value: 'large3', label: '巨大大3' },
          { value: 'large4', label: '超大选项4' },
          { value: 'large5', label: '超大选项5' },
          { value: 'large6', label: '超大选项6' },
        ]}
        direction="horizontal"
        gap={8}
        buttonColumns={4}
      />
    </>
  )
}
