import { Checkbox } from '@ftsukic/tsuki'
import type { CheckboxValue } from '@ftsukic/tsuki'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Button checkbox
 * @description Checkbox 的 button variant 复用同一套 checked、unchecked 和 disabled 状态。
 */
export default function Example() {
  const [value, setValue] = useState<CheckboxValue[]>(['apple'])

  return (
    <View style={{ gap: 12 }}>
      <Checkbox>Default checkbox</Checkbox>
      <Checkbox variant="button" disabled>
        Disabled button
      </Checkbox>
      <Checkbox.Group
        direction="horizontal"
        gap={8}
        value={value}
        onChange={setValue}
        buttonVariant="filled"
      >
        <Checkbox variant="button" name="apple">
          Apple
        </Checkbox>
        <Checkbox variant="button" name="orange">
          Orange
        </Checkbox>
        <Checkbox variant="button" name="disabled" disabled>
          Disabled
        </Checkbox>
      </Checkbox.Group>
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        已选择：{value.join(', ') || '无'}
      </Text>
    </View>
  )
}
