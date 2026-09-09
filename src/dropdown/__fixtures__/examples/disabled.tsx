import { DropdownItem, DropdownMenu } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title Dropdown disabled states
 * @description 禁用整个菜单项或单个 option 时保持标题展示但不响应点击。
 */
export default function DisabledDropdownExample() {
  return (
    <View style={styles.container}>
      <DropdownMenu>
        <DropdownItem title="不可用" disabled options={[{ text: '不可用', value: 'disabled' }]} />
        <DropdownItem
          defaultValue="available"
          options={[
            { text: '不可选', value: 'disabled', disabled: true },
            { text: '可选项', value: 'available' },
          ]}
        />
      </DropdownMenu>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingBottom: 80 },
})
