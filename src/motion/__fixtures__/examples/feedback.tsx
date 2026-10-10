import { useState } from 'react'
import { Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { Loading } from '../../../loading'
import { Skeleton } from '../../../skeleton'
import { MotionPressable } from '../..'
import { useFeedbackMotion } from '../../useFeedbackMotion'
import { MOTION_DURATION } from '../../token'

/**
 * @title 反馈动效
 * @description Loading spin、Skeleton pulse 与内部 shake 预设；统一遵循主题策略。
 */
export default function FeedbackExample() {
  const [request, setRequest] = useState(0)
  return (
    <View style={{ padding: 16, gap: 16 }}>
      <Loading>加载中</Loading>
      <Skeleton title row={3} />
      <MotionPressable
        onPress={() => setRequest((previous) => previous + 1)}
        accessibilityRole="button"
        style={{ padding: 12, backgroundColor: '#eaf2ff' }}
      >
        <Text>触发错误反馈</Text>
      </MotionPressable>
      <ShakeSample key={request} />
    </View>
  )
}
function ShakeSample() {
  const animatedStyle = useFeedbackMotion('shake', MOTION_DURATION.slow)
  return (
    <Animated.View style={[{ padding: 12, backgroundColor: '#fee4e2' }, animatedStyle]}>
      <Text>请检查输入</Text>
    </Animated.View>
  )
}
