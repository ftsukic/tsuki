import { Cell, SwipeCell, Text, useSwipeCellDismiss } from '../../..'
import { View } from 'react-native'

/**
 * @title 页面单开协调
 * @description 由页面 Hook 管理展开行，多个行之间互斥，不依赖全局 Provider。
 */
export default function SwipeCellCoordinationFixture() {
  const dismiss = useSwipeCellDismiss()
  return (
    <View {...dismiss.containerProps} style={{ gap: 12 }}>
      <Text>由当前页面维护展开行：展开另一行或触摸本区域外侧内容时收起。</Text>
      {['第一项', '第二项', '第三项'].map((title) => (
        <SwipeCell
          key={title}
          {...dismiss.getSwipeCellProps(title)}
          actions={[{ text: '删除', color: 'danger' }]}
        >
          <Cell title={title} description="展开另一行时收起当前行" />
        </SwipeCell>
      ))}
    </View>
  )
}
