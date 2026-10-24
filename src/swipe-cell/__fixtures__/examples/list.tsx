import { Cell, SwipeCell, useSwipeCellDismiss } from '../../..'
import { FlatList, View } from 'react-native'

const rows = ['收件箱', '项目讨论', '设计评审', '发布检查', '归档']

/**
 * @title FlatList 接入
 * @description 页面 Hook 管理行间互斥、外部触摸和滚动关闭。
 */
export default function SwipeCellListFixture() {
  const dismiss = useSwipeCellDismiss()
  return (
    <View {...dismiss.containerProps}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item}
        onScrollBeginDrag={dismiss.close}
        renderItem={({ item }) => (
          <SwipeCell
            {...dismiss.getSwipeCellProps(item)}
            actions={[{ text: '更多', color: 'primary' }]}
          >
            <Cell title={item} description="开始滚动或触摸其他位置时收起" />
          </SwipeCell>
        )}
        style={{ maxHeight: 260 }}
      />
    </View>
  )
}
