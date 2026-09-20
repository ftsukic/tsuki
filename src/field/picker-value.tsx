import type { ReactNode } from 'react'
import { Text } from '../text'
import type { PickerOption } from '../picker/types'

export function renderFieldPickerValue(
  value: ReactNode,
  type: 'default' | 'tertiary',
  valueAlign: 'left' | 'center' | 'right',
) {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Text type={type} numberOfLines={1} style={{ textAlign: valueAlign }}>
        {value}
      </Text>
    )
  }
  return value
}

export function createPickerDisplayOptions<Value extends string>(
  values: readonly Value[],
): PickerOption[] {
  return values.map((value) => ({ text: String(value), value }))
}
