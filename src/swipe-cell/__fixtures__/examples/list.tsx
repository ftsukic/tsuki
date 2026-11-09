import { Cell, SwipeCell, SwipeCellAction, SwipeCellGroup, useSwipeCellController } from '../../..'
import {
  FlatList,
  Platform,
  Pressable as NativePressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { createElement, useState } from 'react'

interface Message {
  id: string
  kind: 'view' | 'native' | 'cell'
  title: string
}

const messages: Message[] = [
  { id: 'inbox', kind: 'view', title: '收件箱 · 普通 View' },
  { id: 'project', kind: 'native', title: '项目讨论 · 原生 Pressable' },
  { id: 'review', kind: 'cell', title: '设计评审 · Tsuki Cell' },
  { id: 'release', kind: 'native', title: '发布检查 · 原生 Pressable' },
  { id: 'archive', kind: 'view', title: '归档 · 普通 View' },
]

function ListTouchBoundary({ children }: { children: React.ReactNode }) {
  const swipeCell = useSwipeCellController()
  if (Platform.OS === 'web') {
    return createElement(
      'div',
      {
        'data-testid': 'flat-list-touch-boundary',
        onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => {
          const target = event.target as unknown as {
            closest?: (selector: string) => unknown
          } | null
          if (target?.closest?.('[id^="tsuki-swipe-cell-action-"]')) return
          swipeCell.closeCurrent()
        },
        onTouchStart: swipeCell.closeCurrent,
        style: { display: 'flex', flexDirection: 'column', minHeight: 310 },
      },
      children,
    )
  }

  return (
    <View
      onTouchStart={swipeCell.closeCurrent}
      style={styles.touchBoundary}
      testID="flat-list-touch-boundary"
    >
      {children}
    </View>
  )
}

function CoordinatedFlatList({ onSelect }: { onSelect: (value: string) => void }) {
  const swipeCell = useSwipeCellController()
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      onScrollBeginDrag={swipeCell.closeCurrent}
      renderItem={({ item }) => (
        <SwipeCell
          id={item.id}
          testID={`flat-swipe-${item.id}`}
          rightAction={
            <SwipeCellAction
              testID={`flat-action-${item.id}`}
              onPress={() => onSelect(`Action：${item.id}`)}
            >
              更多
            </SwipeCellAction>
          }
        >
          <View style={styles.row}>
            {item.kind === 'view' ? (
              <View testID={`flat-view-${item.id}`} style={styles.body}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>点按列表内任意位置可收起已展开项</Text>
              </View>
            ) : item.kind === 'native' ? (
              <NativePressable
                onPress={() => onSelect(`原生 Pressable：${item.id}`)}
                style={styles.body}
                testID={`flat-native-${item.id}`}
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>点击会继续执行原有处理</Text>
              </NativePressable>
            ) : (
              <Cell
                onPress={() => onSelect(`Tsuki Cell：${item.id}`)}
                testID={`flat-cell-${item.id}`}
                title={item.title}
                value="查看"
                showArrow
              />
            )}
          </View>
        </SwipeCell>
      )}
      style={styles.list}
      testID="fixture-list"
    />
  )
}

/**
 * @title SwipeCell + FlatList
 * @description 列表区域触摸会关闭当前项并透传点击；包含普通 View、原生 Pressable 和 Tsuki Cell。
 */
export default function SwipeCellListFixture() {
  const [selected, setSelected] = useState('点击一行查看事件透传')

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>SwipeCell + FlatList</Text>
      <Text testID="flat-selection">{selected}</Text>
      <SwipeCellGroup style={styles.group}>
        <ListTouchBoundary>
          <CoordinatedFlatList onSelect={setSelected} />
          <View style={styles.blank} testID="flat-list-blank" />
        </ListTouchBoundary>
      </SwipeCellGroup>
      <Text style={styles.caption}>滑动打开 Action；触摸空白区域、其他行或当前内容可收起。</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { color: '#333333', fontSize: 16, fontWeight: '600' },
  group: { borderColor: '#ebedf0', borderWidth: StyleSheet.hairlineWidth },
  touchBoundary: { minHeight: 310 },
  list: { height: 260 },
  row: { backgroundColor: '#ffffff', minHeight: 58 },
  body: { backgroundColor: '#ffffff', gap: 4, paddingHorizontal: 16, paddingVertical: 14 },
  title: { color: '#323233', fontSize: 16 },
  subtitle: { color: '#969799', fontSize: 13 },
  blank: { height: 50 },
  caption: { color: '#969799', fontSize: 13 },
})
