import { FlashList } from '@shopify/flash-list'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Swipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable'
import { SwipeCellAction } from '../../swipe-cell-action'
import { useToken } from '../../../theme'

interface Message {
  id: string
  name: string
}

interface RowBinding {
  id: string
  handle: SwipeableMethods | null
  live: boolean
}

/** Private fixture controller; identity includes the recycled row's data binding. */
export function createFlashListSwipeController() {
  let active: RowBinding | null = null
  return {
    closeOther(row: RowBinding) {
      if (row.live && active && active !== row) this.closeCurrent()
    },
    activate(row: RowBinding) {
      if (!row.live || !row.handle) return
      this.closeOther(row)
      active = row
    },
    release(row: RowBinding) {
      if (active === row) active = null
    },
    closeCurrent() {
      const previous = active
      active = null
      previous?.handle?.close()
    },
  }
}

type SwipeController = ReturnType<typeof createFlashListSwipeController>

const messages: Message[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `message-${index + 1}`,
  name: `消息 ${index + 1}`,
}))

/** Internal fixture row, exported only for recycling regression coverage. */
export function FlashListMessageRow({
  item,
  controller,
  onDelete,
  onSelect,
}: {
  item: Message
  controller: SwipeController
  onDelete: (id: string) => void
  onSelect?: (id: string) => void
}) {
  const { token } = useToken()
  const ref = useRef<SwipeableMethods | null>(null)
  const binding = useMemo<RowBinding>(() => ({ id: item.id, handle: null, live: false }), [item.id])
  const deleting = useRef<RowBinding | null>(null)
  const [actionsEnabled, setActionsEnabled] = useState(false)

  useLayoutEffect(() => {
    const handle = ref.current
    handle?.reset()
    binding.handle = handle
    binding.live = true
    setActionsEnabled(false)
    return () => {
      binding.live = false
      controller.release(binding)
      deleting.current = null
      // Recycled instances keep their SharedValues unless explicitly reset.
      handle?.reset()
    }
  }, [binding, controller])

  const activate = () => controller.activate(binding)
  const close = () => {
    if (!binding.live) return
    controller.release(binding)
    ref.current?.close()
  }

  return (
    <View testID={`flash-row-${item.id}`} onTouchStart={() => controller.closeOther(binding)}>
      <Swipeable
        ref={ref}
        testID={`flash-swipe-${item.id}`}
        overshootLeft={false}
        overshootFriction={8}
        onSwipeableOpenStartDrag={activate}
        onSwipeableWillOpen={activate}
        onSwipeableOpen={() => {
          if (binding.live) setActionsEnabled(true)
        }}
        onSwipeableWillClose={() => {
          if (binding.live) setActionsEnabled(false)
        }}
        onSwipeableClose={() => {
          if (!binding.live) return
          controller.release(binding)
          if (deleting.current === binding) {
            deleting.current = null
            onDelete(binding.id)
          }
        }}
        renderRightActions={() => (
          <View
            pointerEvents={actionsEnabled ? 'auto' : 'none'}
            accessibilityElementsHidden={!actionsEnabled}
            importantForAccessibility={actionsEnabled ? 'auto' : 'no-hide-descendants'}
            style={styles.actions}
          >
            <SwipeCellAction
              testID={`flash-delete-${item.id}`}
              color="danger"
              width={80}
              onPress={() => {
                deleting.current = binding
                close()
              }}
            >
              删除
            </SwipeCellAction>
          </View>
        )}
      >
        <Pressable
          testID={`flash-content-${item.id}`}
          onPress={() => {
            close()
            onSelect?.(item.id)
          }}
          style={[styles.row, { backgroundColor: token.colorBgContainer }]}
        >
          <Text style={[styles.name, { color: token.colorText }]}>{item.name}</Text>
          <Text style={[styles.preview, { color: token.colorTextSecondary }]}>
            左滑展开；点击其他行或滚动收起
          </Text>
        </Pressable>
      </Swipeable>
    </View>
  )
}

/**
 * @title RNGH + FlashList with 1000 messages
 * @description 无需 SwipeCellProvider：列表协调单开、滚动关闭，数据复用时 reset，关闭完成后删除。
 */
export default function SwipeCellFlashListFixture() {
  const [items, setItems] = useState(messages)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const controller = useMemo(createFlashListSwipeController, [])
  const closeCurrent = useCallback(() => controller.closeCurrent(), [controller])
  const deleteMessage = useCallback((id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id))
  }, [])

  useLayoutEffect(() => () => controller.closeCurrent(), [controller])

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>RNGH + FlashList · {items.length} 条</Text>
      <Text>无需 SwipeCellProvider；页面空白区域不自动关闭。</Text>
      <Text testID="flash-selection">
        {selectedId ? `已点击：${selectedId}` : '点击消息查看结果'}
      </Text>
      <View style={styles.list}>
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          onScrollBeginDrag={closeCurrent}
          renderItem={({ item }) => (
            <FlashListMessageRow
              item={item}
              controller={controller}
              onDelete={deleteMessage}
              onSelect={setSelectedId}
            />
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { fontSize: 16, fontWeight: '600' },
  list: { height: 320 },
  row: { gap: 4, paddingHorizontal: 16, paddingVertical: 14 },
  actions: { flexDirection: 'row', alignSelf: 'stretch' },
  name: { fontSize: 16, fontWeight: '600' },
  preview: { fontSize: 13 },
})
