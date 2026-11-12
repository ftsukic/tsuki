import { Cell, SwipeCell, useToken } from '../../..'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title 点击、长按与拖动
 * @description 收起状态显示按压反馈并响应业务事件；展开状态只关闭 action，拖动取消按压反馈。
 */
export default function SwipeCellContentCloseFixture() {
  const { token } = useToken()
  const [clicks, setClicks] = useState(0)
  const [holds, setHolds] = useState(0)
  return (
    <View style={{ gap: 12 }}>
      <SwipeCell actions={[{ text: '删除', color: 'danger' }]}>
        <Cell
          title="点击或长按这行"
          description={`业务点击 ${clicks} 次 · 业务长按 ${holds} 次`}
          onPress={() => setClicks((count) => count + 1)}
          onLongPress={() => setHolds((count) => count + 1)}
          styles={({ state }) => ({ root: { opacity: state.pressed ? 0.7 : 1 } })}
        />
      </SwipeCell>
      <Text style={{ color: token.colorTextSecondary }}>
        先左滑展开，再点击或长按：只收起操作，计数不变。拖动超过阈值后取消按压样式。
      </Text>
    </View>
  )
}
