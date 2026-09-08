import { SwipeCell, SwipeCellAction, SwipeCellGroup } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title SwipeCellGroup
 * @description Group cells together so opening one cell automatically closes the others.
 */
export default function SwipeCellGroupFixture() {
  const rows = ['待处理任务', '设计评审', '发布检查']

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>单开分组</Text>
      <SwipeCellGroup style={styles.group}>
        {rows.map((title, index) => (
          <SwipeCell
            key={title}
            rightAction={
              <SwipeCellAction
                onPress={() => undefined}
                backgroundColor={index === rows.length - 1 ? '#1989FA' : '#EE0A24'}
              >
                {index === rows.length - 1 ? '完成功能' : '不删除'}
              </SwipeCellAction>
            }
          >
            <View style={[styles.content, index < rows.length - 1 && styles.divider]}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>向左滑动查看操作</Text>
            </View>
          </SwipeCell>
        ))}
      </SwipeCellGroup>
      <Text style={styles.caption}>同一 Group 内同时只保持一个 SwipeCell 展开。</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  group: {
    borderColor: '#ebedf0',
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    backgroundColor: '#ffffff',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: {
    borderBottomColor: '#ebedf0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    color: '#323233',
    fontSize: 16,
  },
  subtitle: {
    color: '#969799',
    fontSize: 13,
  },
  caption: {
    color: '#969799',
    fontSize: 13,
  },
})
