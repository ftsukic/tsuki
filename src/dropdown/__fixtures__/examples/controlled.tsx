import { Button, DropdownItem, DropdownMenu } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Dropdown controlled value
 * @description 由外部 state 控制 DropdownItem.value，并通过按钮修改当前选择。
 */
export default function ControlledDropdownExample() {
  const [value, setValue] = useState<'newest' | 'oldest'>('newest')

  return (
    <View style={styles.container}>
      <DropdownMenu>
        <DropdownItem
          value={value}
          options={[
            { text: '最新发布', value: 'newest' },
            { text: '最早发布', value: 'oldest' },
          ]}
          onChange={(next) => setValue(next as 'newest' | 'oldest')}
        />
      </DropdownMenu>
      <Text style={styles.value}>外部值：{value}</Text>
      <Button size="small" onPress={() => setValue(value === 'newest' ? 'oldest' : 'newest')}>
        外部切换
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  value: { color: '#667085', fontSize: 13 },
})
