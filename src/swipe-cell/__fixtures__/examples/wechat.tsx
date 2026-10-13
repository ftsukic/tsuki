import { SwipeCell, useToken } from '../../..'
import { useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const messages = [
  { id: 'team', name: '项目讨论', preview: '今晚同步一下发布计划', time: '10:24' },
  { id: 'design', name: '设计评审', preview: '新的消息列表稿已更新', time: '09:48' },
  { id: 'inbox', name: '文件传输助手', preview: '演示文稿已发送', time: '昨天' },
]

/**
 * @title WeChat message list
 * @description 微信消息列表风格的右滑 action、稳定 id 和主体点击态。
 */
export default function SwipeCellWeChatFixture() {
  const { token } = useToken()
  const pendingActions = useRef(new Map<string, () => void>())
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const visibleMessages = messages.filter((message) => !deletedIds.has(message.id))

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: token.colorText }]}>微信消息列表</Text>
      {visibleMessages.map((message) => {
        const isPinned = pinnedIds.has(message.id)
        const isUnread = unreadIds.has(message.id)

        return (
          <SwipeCell
            key={message.id}
            id={message.id}
            testID={`wechat-${message.id}`}
            onClose={() => {
              const action = pendingActions.current.get(message.id)
              pendingActions.current.delete(message.id)
              action?.()
            }}
            actions={[
              {
                key: 'pin',
                text: isPinned ? '取消置顶' : '置顶',
                backgroundColor: token.colorBgElevated,
                textColor: token.colorText,
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
                text: '未读',
                color: 'primary',
                onPress: () => {
                  pendingActions.current.set(message.id, () => {
                    setUnreadIds((current) => new Set(current).add(message.id))
                  })
                },
              },
              {
                key: 'delete',
                text: '删除',
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
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { fontSize: 16, fontWeight: '600' },
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
  name: { fontSize: 16, fontWeight: '600' },
  time: { fontSize: 12 },
  preview: { fontSize: 13 },
})
