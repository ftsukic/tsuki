import { Button, Cell, SwipeCell, type SwipeCellRef } from '../../..'
import { useRef } from 'react'
import { View } from 'react-native'

/**
 * @title Ref 控制
 * @description 通过 open / close 手动开关，左右两侧可单独指定。
 */
export default function SwipeCellRefFixture() {
  const ref = useRef<SwipeCellRef>(null)
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button size="small" onPress={() => ref.current?.open('left')}>
          打开左侧
        </Button>
        <Button size="small" type="primary" onPress={() => ref.current?.open('right')}>
          打开右侧
        </Button>
        <Button size="small" onPress={() => ref.current?.close()}>
          关闭
        </Button>
      </View>
      <SwipeCell
        ref={ref}
        leftActions={[{ text: '置顶', color: 'warning' }]}
        actions={[{ text: '删除', color: 'danger' }]}
      >
        <Cell title="命令式控制" description="open('left' | 'right') / close()" />
      </SwipeCell>
    </View>
  )
}
