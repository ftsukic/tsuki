import { FlashList } from '@shopify/flash-list'
import { createElement, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { SwipeCell, SwipeCellAction, SwipeCellGroup, useSwipeCellController } from '../../..'

interface Message {
  id: string
  name: string
}

interface RowBinding {
  id: string
  name: string
}

const messages: Message[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `message-${index + 1}`,
  name: `消息 ${index + 1}`,
}))

/** Internal fixture row, exported for FlashList recycling regression coverage. */
export function FlashListMessageRow({
  item,
  onDelete,
  onClose,
  onOpen,
  onSelect,
}: {
  item: RowBinding
  onDelete: (id: string) => void
  onClose?: (id: string) => void
  onOpen?: (id: string) => void
  onSelect?: (id: string) => void
}) {
  const deletingItemId = useRef<string | null>(null)
  const previousItemId = useRef(item.id)

  useLayoutEffect(() => {
    if (previousItemId.current === item.id) return
    previousItemId.current = item.id
    deletingItemId.current = null
  }, [item.id])

  return (
    <View testID={`flash-row-${item.id}`}>
      <SwipeCell
        id={item.id}
        testID={`flash-swipe-${item.id}`}
        onOpen={() => onOpen?.(item.id)}
        onClose={() => {
          if (deletingItemId.current === item.id) {
            deletingItemId.current = null
            onDelete(item.id)
            return
          }
          onClose?.(item.id)
        }}
        rightAction={
          <SwipeCellAction
            testID={`flash-delete-${item.id}`}
            color="danger"
            width={80}
            onPress={() => {
              deletingItemId.current = item.id
            }}
          >
            删除
          </SwipeCellAction>
        }
      >
        <Pressable
          testID={`flash-content-${item.id}`}
          onPress={() => onSelect?.(item.id)}
          style={styles.row}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.preview}>左滑展开；点击其他行或滚动收起</Text>
        </Pressable>
      </SwipeCell>
    </View>
  )
}

function FlashListTouchBoundary({ children }: { children: React.ReactNode }) {
  const swipeCell = useSwipeCellController()
  if (Platform.OS === 'web') {
    return createElement(
      'div',
      {
        'data-testid': 'flash-list-touch-boundary',
        onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => {
          const target = event.target as unknown as {
            closest?: (selector: string) => unknown
          } | null
          if (target?.closest?.('[id^="tsuki-swipe-cell-action-"]')) return
          swipeCell.closeCurrent()
        },
        onTouchStart: swipeCell.closeCurrent,
        style: { display: 'flex', flexDirection: 'column', minHeight: 356 },
      },
      children,
      createElement('div', {
        'data-testid': 'flash-list-blank',
        style: { height: 36 },
      }),
    )
  }

  return (
    <View
      onTouchStart={swipeCell.closeCurrent}
      style={styles.touchBoundary}
      testID="flash-list-touch-boundary"
    >
      {children}
      <View style={styles.blank} testID="flash-list-blank" />
    </View>
  )
}

function CoordinatedFlashList({
  items,
  onDelete,
  onClose,
  onOpen,
  onSelect,
}: {
  items: readonly Message[]
  onDelete: (id: string) => void
  onClose: (id: string) => void
  onOpen: (id: string) => void
  onSelect: (id: string) => void
}) {
  const swipeCell = useSwipeCellController()
  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <FlashListMessageRow
        item={item}
        onClose={onClose}
        onDelete={onDelete}
        onOpen={onOpen}
        onSelect={onSelect}
      />
    ),
    [onClose, onDelete, onOpen, onSelect],
  )

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => item.id}
      onScrollBeginDrag={swipeCell.closeCurrent}
      renderItem={renderItem}
      style={styles.list}
    />
  )
}

/**
 * @title SwipeCell + FlashList with 1000 messages
 * @description 公共 SwipeCell 支持列表触摸协调；稳定 item.id 绑定回收行并重置旧位移与动画。
 */
export default function SwipeCellFlashListFixture() {
  const [items, setItems] = useState(messages)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openedId, setOpenedId] = useState<string | null>(null)
  const deleteMessage = useCallback((id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id))
  }, [])
  const handleOpen = useCallback((id: string) => setOpenedId(id), [])
  const handleClose = useCallback(
    (id: string) => setOpenedId((current) => (current === id ? null : current)),
    [],
  )
  const handleSelect = useCallback((id: string) => setSelectedId(id), [])

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>SwipeCell + FlashList · {items.length} 条</Text>
      <Text>使用公共 SwipeCell；点按当前 Action 执行删除。</Text>
      <Text testID="flash-selection">
        {selectedId ? `已点击：${selectedId}` : '点击消息查看结果'}
      </Text>
      <Text testID="flash-opened">{openedId ? `展开：${openedId}` : '尚无展开项'}</Text>
      <SwipeCellGroup>
        <FlashListTouchBoundary>
          <CoordinatedFlashList
            items={items}
            onClose={handleClose}
            onDelete={deleteMessage}
            onOpen={handleOpen}
            onSelect={handleSelect}
          />
        </FlashListTouchBoundary>
      </SwipeCellGroup>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { fontSize: 16, fontWeight: '600' },
  touchBoundary: { minHeight: 356 },
  list: { height: 320 },
  row: { backgroundColor: '#ffffff', gap: 4, paddingHorizontal: 16, paddingVertical: 14 },
  name: { color: '#323233', fontSize: 16, fontWeight: '600' },
  preview: { color: '#969799', fontSize: 13 },
  blank: { height: 36 },
})
