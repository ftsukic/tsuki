import { SwipeCell } from '../../..'
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
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>微信消息列表</Text>
      {messages.map((message) => (
        <SwipeCell key={message.id} id={message.id} actions={[{ text: '删除', color: 'danger' }]}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{message.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.message}>
              <View style={styles.titleRow}>
                <Text style={styles.name}>{message.name}</Text>
                <Text style={styles.time}>{message.time}</Text>
              </View>
              <Text numberOfLines={1} style={styles.preview}>
                {message.preview}
              </Text>
            </View>
          </View>
        </SwipeCell>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { color: '#333333', fontSize: 16, fontWeight: '600' },
  row: { alignItems: 'center', backgroundColor: '#ffffff', flexDirection: 'row', padding: 14 },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#07c160',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  message: { flex: 1, gap: 4, marginLeft: 12 },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  name: { color: '#222222', fontSize: 16, fontWeight: '600' },
  time: { color: '#999999', fontSize: 12 },
  preview: { color: '#999999', fontSize: 13 },
})
