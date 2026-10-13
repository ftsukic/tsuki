import { FlashList } from '@shopify/flash-list'
import { Cell, Checkbox } from '../../..'
import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface Item {
  id: string
  name: string
  disabled?: boolean
}

const items: Item[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `option-${index + 1}`,
  name: `选项 ${index + 1}`,
  disabled: index === 2 || index === 7,
}))

/**
 * @title FlashList 全选
 * @description 在 FlashList 大列表中使用受控 Checkbox、Cell 整行点击和 checked / indeterminate 实现全选。
 */
export default function CheckboxFlashListFixture() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(['option-1', 'option-3']))
  const selectableIds = useMemo(
    () => items.filter((item) => !item.disabled).map((item) => item.id),
    [],
  )
  const selectedCount = useMemo(
    () => selectableIds.reduce((count, id) => count + (selected.has(id) ? 1 : 0), 0),
    [selectableIds, selected],
  )
  const allChecked = selectableIds.length > 0 && selectedCount === selectableIds.length
  const indeterminate = selectedCount > 0 && selectedCount < selectableIds.length

  const toggle = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelected((current) => {
      const next = new Set(current)

      if (allChecked) {
        for (const id of selectableIds) {
          next.delete(id)
        }
      } else {
        for (const id of selectableIds) {
          next.add(id)
        }
      }

      return next
    })
  }, [allChecked, selectableIds])

  return (
    <View style={styles.container}>
      <Text>FlashList 1000 条</Text>
      {/* Give FlashList a bounded viewport inside the overview ScrollView. */}
      <View style={styles.listViewport}>
        <FlashList
          data={items}
          extraData={selected}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <Cell
              title="全选"
              description={`已选择 ${selectedCount} / ${selectableIds.length}`}
              divider
              clickable={selectableIds.length > 0}
              disabled={selectableIds.length === 0}
              onPress={toggleAll}
              trailing={
                <Checkbox
                  checked={allChecked}
                  indeterminate={indeterminate}
                  disabled={selectableIds.length === 0}
                  pointerEvents="none"
                />
              }
            />
          }
          renderItem={({ item, index }) => (
            <Cell
              title={item.name}
              divider={index < items.length - 1}
              disabled={item.disabled}
              clickable={!item.disabled}
              onPress={item.disabled ? undefined : () => toggle(item.id)}
              trailing={
                <Checkbox
                  checked={selected.has(item.id)}
                  disabled={item.disabled}
                  pointerEvents="none"
                />
              }
            />
          )}
          style={styles.list}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  listViewport: {
    height: 360,
    flexShrink: 0,
  },
  list: {
    flex: 1,
  },
})
