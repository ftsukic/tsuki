import type { CheckboxGroupRef, CheckboxValue } from '@ftsukic/tsuki'
import { Checkbox } from '@ftsukic/tsuki'
import { useRef, useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title 全选与半选
 * @description 由业务侧根据 value 计算全选和半选，再组合 Checkbox.indeterminate 与 Checkbox.Group.toggleAll。
 */
export default function CheckAllExample() {
  const groupRef = useRef<CheckboxGroupRef>(null)
  const [value, setValue] = useState<CheckboxValue[]>(['apple'])
  const selectableValues: CheckboxValue[] = ['apple', 'banana']
  const isSelected = (item: CheckboxValue) => value.some((valueItem) => Object.is(valueItem, item))
  const checkedAll =
    selectableValues.length > 0 && selectableValues.every((item) => isSelected(item))
  const indeterminate = selectableValues.some((item) => isSelected(item)) && !checkedAll

  return (
    <View style={{ gap: 12 }}>
      <Checkbox
        checked={checkedAll}
        indeterminate={indeterminate}
        onChange={(checked) => {
          groupRef.current?.toggleAll({ checked, skipDisabled: true })
        }}
      >
        全选
      </Checkbox>
      <Checkbox.Group ref={groupRef} value={value} onChange={setValue} gap={12}>
        <Checkbox name="apple">Apple</Checkbox>
        <Checkbox name="banana">Banana</Checkbox>
        <Checkbox name="orange" disabled>
          Orange（禁用）
        </Checkbox>
      </Checkbox.Group>
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        当前值：{value.join(', ') || '无'}
      </Text>
    </View>
  )
}
