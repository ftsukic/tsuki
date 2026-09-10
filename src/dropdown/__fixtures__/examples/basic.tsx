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
      <DropdownMenu activeColor="#1677ff">
        <DropdownItem
          value={sort}
          options={[
            { text: '默认排序', value: 'default' },
            { text: '销量优先', value: 'sales' },
            { text: '价格优先', value: 'price' },
          ]}
          onChange={(value) => setSort(String(value))}
        />
        <DropdownItem
          defaultValue="all"
          options={[
            { text: '全部商品', value: 'all' },
            { text: '仅看有库存', value: 'in-stock' },
            { text: '预售商品', value: 'preorder', disabled: true },
          ]}
        />
        <DropdownItem
          defaultValue="all"
          options={[
            { text: '全部区域', value: 'all' },
            { text: '附近门店', value: 'nearby' },
            { text: '跨区配送', value: 'cross-region' },
          ]}
        />
      </DropdownMenu>
      <Text style={styles.result}>当前排序：{sort}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  result: { color: '#667085', fontSize: 13, paddingHorizontal: 12 },
})
