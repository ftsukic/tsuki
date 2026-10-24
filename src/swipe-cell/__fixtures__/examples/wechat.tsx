import {
  SwipeCell,
  useToken,
  useSwipeCellDismiss,
  type SwipeCellRef,
  type SwipeCellDismissController,
} from '../../..'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const messages = [
  { id: 'team', name: '项目讨论', preview: '今晚同步一下发布计划', time: '10:24' },
  { id: 'design', name: '设计评审', preview: '新的消息列表稿已更新', time: '09:48' },
  { id: 'inbox', name: '文件传输助手', preview: '演示文稿已发送', time: '昨天' },
]

/**
 * @title 微信效果
 * @description 微信消息列表风格的右滑 action、稳定 id 和主体点击态。
 */
const SwipeCellWeChatFixture = forwardRef<SwipeCellRef, { dismiss?: SwipeCellDismissController }>(
  function SwipeCellWeChatFixture({ dismiss }, ref) {
    const { token } = useToken()
    const localDismiss = useSwipeCellDismiss()
    const coordinator = dismiss ?? localDismiss
    const cells = useRef(new Map<string, SwipeCellRef>())
    useImperativeHandle(
      ref,
      () => ({
        open: (side) => cells.current.values().next().value?.open(side),
        close: () => cells.current.forEach((cell) => cell.close()),
      }),
      [],
    )
    const pendingActions = useRef(new Map<string, () => void>())
    const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())
    const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set())
    const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

    const visibleMessages = messages.filter((message) => !deletedIds.has(message.id))

    return (
      <View
        {...(dismiss ? {} : localDismiss.containerProps)}
        pointerEvents="box-none"
        style={styles.container}
      >
        {visibleMessages.map((message) => {
          const binding = coordinator.getSwipeCellProps(message.id)
          const isPinned = pinnedIds.has(message.id)
          const isUnread = unreadIds.has(message.id)

          return (
            <SwipeCell
              {...binding}
              key={message.id}
              overshoot
              contentDragLimit={styles.row.padding + styles.avatar.width}
              ref={(cell) => {
                binding?.ref(cell)
                if (cell) cells.current.set(message.id, cell)
                else cells.current.delete(message.id)
              }}
              id={message.id}
              testID={`wechat-${message.id}`}
              onClose={() => {
                binding?.onClose()
                const action = pendingActions.current.get(message.id)
                pendingActions.current.delete(message.id)
                action?.()
              }}
              actions={[
                {
                  key: 'pin',
                  width: 64,
                  text: (
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="clip"
                      style={[styles.actionText, { color: token.colorTextLightSolid }]}
                    >
                      {isPinned ? '取消置顶' : '置顶'}
                    </Text>
                  ),
                  color: 'warning',
                  onPress: () => {
                    pendingActions.current.set(message.id, () => {
                      setPinnedIds((current) => {
                        const next = new Set(current)
                        if (next.has(message.id)) next.delete(message.id)
                        else next.add(message.id)
                        return next
                      })
                    })
                  },
                },
                {
                  key: 'unread',
                  width: 64,
                  text: (
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="clip"
                      style={[styles.actionText, { color: token.colorTextLightSolid }]}
                    >
                      未读
                    </Text>
                  ),
                  color: 'primary',
                  onPress: () => {
                    pendingActions.current.set(message.id, () => {
                      setUnreadIds((current) => new Set(current).add(message.id))
                    })
                  },
                },
                {
                  key: 'delete',
                  width: 64,
                  text: (
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="clip"
                      style={[styles.actionText, { color: token.colorTextLightSolid }]}
                    >
                      删除
                    </Text>
                  ),
                  color: 'danger',
                  onPress: () => {
                    pendingActions.current.set(message.id, () => {
                      setDeletedIds((current) => new Set(current).add(message.id))
                    })
                  },
                },
              ]}
            >
              <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: token.colorSuccess }]}>
                  <Text style={[styles.avatarText, { color: token.colorTextLightSolid }]}>
                    {message.name.slice(0, 1)}
                  </Text>
                </View>
                <View style={styles.message}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.name, { color: token.colorText }]}>{message.name}</Text>
                    <Text style={[styles.time, { color: token.colorTextSecondary }]}>
                      {message.time}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.preview, { color: token.colorTextSecondary }]}
                  >
                    {isUnread ? '未读 · ' : ''}
                    {message.preview}
                  </Text>
                </View>
              </View>
            </SwipeCell>
          )
        })}
      </View>
    )
  },
)

export default SwipeCellWeChatFixture

const messageFontSize = 16

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { alignItems: 'center', flexDirection: 'row', padding: 14 },
  avatar: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: { fontSize: 18, fontWeight: '600' },
  message: { flex: 1, gap: 4, marginLeft: 12 },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: messageFontSize, fontWeight: '600' },
  actionText: { fontSize: messageFontSize, textAlign: 'center', width: '100%' },
  time: { fontSize: 12 },
  preview: { fontSize: 13 },
})
