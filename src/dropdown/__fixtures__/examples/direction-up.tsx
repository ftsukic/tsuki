import { DropdownItem, DropdownMenu } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Dropdown direction up
 * @description 将菜单放在页面底部，检查面板从菜单上方展开且遮罩不覆盖触发栏。
 */
export default function DirectionUpDropdownExample() {
  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <Text style={styles.hint}>菜单靠近底部时使用 direction up</Text>
      <DropdownMenu direction="up">
        <DropdownItem
          defaultValue="all"
          options={[
            { text: '全部', value: 'all' },
            { text: '已完成', value: 'done' },
            { text: '未完成', value: 'todo' },
          ]}
        />
        <DropdownItem title="更多筛选">
          <View style={styles.panel}>
            <Text>向上展开的自定义内容</Text>
          </View>
        </DropdownItem>
      </DropdownMenu>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { minHeight: 360 },
  hint: { color: '#667085', fontSize: 13, paddingBottom: 12 },
  panel: { padding: 20 },
  spacer: { flex: 1 },
})
