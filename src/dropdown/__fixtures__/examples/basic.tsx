import { DropdownItem, DropdownMenu } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Dropdown basic usage
 * @description 使用 options 快速生成排序菜单，并组合一个自定义筛选面板。
 */
export default function BasicDropdownExample() {
  const [sort, setSort] = useState('default')

  return (
    <View style={styles.container}>
      <DropdownMenu>
        <DropdownItem
          value={sort}
          options={[
            { text: '默认排序', value: 'default' },
            { text: '销量优先', value: 'sales' },
            { text: '价格优先', value: 'price' },
          ]}
          onChange={(value) => setSort(String(value))}
        />
        <DropdownItem title="筛选">
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>筛选条件</Text>
            <Text style={styles.panelText}>自定义内容可以组合任意 React Native 布局。</Text>
          </View>
        </DropdownItem>
      </DropdownMenu>
      <Text style={styles.result}>当前排序：{sort}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  panel: { gap: 8, padding: 16 },
  panelText: { color: '#667085', fontSize: 13 },
  panelTitle: { color: '#1d2939', fontSize: 15, fontWeight: '600' },
  result: { color: '#667085', fontSize: 13, paddingHorizontal: 12 },
})
