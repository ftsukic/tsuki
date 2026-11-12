import { Stack } from 'expo-router/stack'
import { useFocusEffect } from 'expo-router'
import { useCallback, useRef } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, useSwipeCellDismiss, type SwipeCellRef } from '@ftsukic/tsuki'
import WeChatSwipeCell from '../../../src/swipe-cell/__fixtures__/examples/wechat'

export default function WeChatSwipeScreen() {
  const ref = useRef<SwipeCellRef>(null)
  const dismiss = useSwipeCellDismiss()
  useFocusEffect(useCallback(() => () => dismiss.close(), [dismiss]))
  return (
    <SafeAreaView
      {...dismiss.containerProps}
      edges={['left', 'right', 'bottom']}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ title: '微信手势 · SwipeCell' }} />
      <View pointerEvents="box-none" style={{ padding: 16, gap: 16 }}>
        <WeChatSwipeCell ref={ref} dismiss={dismiss} />
        <Button onPress={() => ref.current?.open()}>展开第一条</Button>
      </View>
    </SafeAreaView>
  )
}
