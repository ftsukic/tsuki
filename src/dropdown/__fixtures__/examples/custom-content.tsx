import { Button, Cell, DropdownItem, DropdownMenu } from '@ftsukic/tsuki'
import { useRef } from 'react'
import type { DropdownItemRef } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title Dropdown custom content
 * @description 自定义面板内组合 Cell、Button 和本地布局，并通过 DropdownItem ref 关闭。
 */
export default function CustomContentDropdownExample() {
  const itemRef = useRef<DropdownItemRef>(null)

  return (
    <DropdownMenu>
      <DropdownItem ref={itemRef} title="自定义筛选">
        <View style={styles.panel}>
          <Cell title="仅看有货" value="开关" />
          <Cell title="配送方式" value="不限" />
          <Button type="primary" block onPress={() => itemRef.current?.close()}>
            应用筛选
          </Button>
        </View>
      </DropdownItem>
    </DropdownMenu>
  )
}

const styles = StyleSheet.create({
  panel: { gap: 10, padding: 12 },
})
