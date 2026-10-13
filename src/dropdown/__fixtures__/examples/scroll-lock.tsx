import { DropdownItem, DropdownMenu, Text, useBackgroundScrollLocked } from '@ftsukic/tsuki'
import { ScrollView, View } from 'react-native'

const options = Array.from({ length: 30 }, (_, value) => ({ text: `选项 ${value + 1}`, value }))

/**
 * @title Dropdown background scroll lock
 * @description 宿主 scrollEnabled 接入锁状态；面板列表与菜单横向滚动保持可用。
 */
export default function ScrollLockDropdownExample() {
  const locked = useBackgroundScrollLocked()
  return (
    <ScrollView style={{ height: 360 }} nestedScrollEnabled scrollEnabled={!locked}>
      <Text style={{ padding: 16 }}>先滚动背景，再打开菜单；关闭后背景恢复滚动。</Text>
      <DropdownMenu swipeThreshold={3}>
        {Array.from({ length: 5 }, (_, index) => (
          <DropdownItem
            key={index}
            title={`菜单 ${index + 1}`}
            defaultValue={0}
            options={options}
          />
        ))}
      </DropdownMenu>
      {Array.from({ length: 20 }, (_, index) => (
        <View key={index} style={{ padding: 20 }}>
          <Text>背景内容 {index + 1}</Text>
        </View>
      ))}
    </ScrollView>
  )
}
