import { FlashList } from '@shopify/flash-list'
import { useLayoutEffect, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import {
  Cell,
  SwipeCell,
  Text,
  useSwipeCellDismiss,
  type SwipeCellDismissController,
} from '../../..'

const messages = Array.from({ length: 1000 }, (_, index) => ({
  id: `message-${index + 1}`,
  title: `消息 ${index + 1}`,
}))
type Message = (typeof messages)[number]

function DismissMessageRow({
  item,
  dismiss,
  onDelete,
}: {
  item: Message
  dismiss: SwipeCellDismissController
  onDelete: (id: string) => void
}) {
  const binding = dismiss.getSwipeCellProps(item.id)
  const deleting = useRef(false)
  useLayoutEffect(() => {
    deleting.current = false
  }, [item.id])
  return (
    <SwipeCell
      key={item.id}
      testID={`flash-swipe-${item.id}`}
      {...binding}
      actions={[
        {
          text: '删除',
          color: 'danger',
          width: 64,
          onPress: () => {
            deleting.current = true
          },
        },
      ]}
      onClose={() => {
        binding.onClose()
        if (deleting.current) {
          deleting.current = false
          onDelete(item.id)
        }
      }}
    >
      <Cell title={item.title} description="左滑展开，触摸其他位置收起" clickable />
    </SwipeCell>
  )
}

/**
 * @title FlashList 1000 条
 * @description 页面 Hook 协调外部触摸、单开和滚动关闭，无需专用 Provider；外部按钮继续响应。
 */
export default function SwipeCellFlashListFixture() {
  const dismiss = useSwipeCellDismiss()
  const [items, setItems] = useState(messages)
  const [clicks, setClicks] = useState(0)
  return (
    <View {...dismiss.containerProps} style={{ gap: 12 }}>
      <Text>SwipeCell + FlashList · {items.length} 条</Text>
      <Pressable onPress={() => setClicks((count) => count + 1)} style={{ padding: 16 }}>
        <Text>外部原生按钮，已点击 {clicks} 次</Text>
      </Pressable>
      <View style={{ height: 320 }}>
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          onScrollBeginDrag={dismiss.close}
          renderItem={({ item }) => (
            <DismissMessageRow
              item={item}
              dismiss={dismiss}
              onDelete={(id) => setItems((previous) => previous.filter((entry) => entry.id !== id))}
            />
          )}
        />
      </View>
      <View style={{ height: 48 }}>
        <Text>这块普通 View 空白区域也可以关闭 action。</Text>
      </View>
    </View>
  )
}
