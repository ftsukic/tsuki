import { useState } from 'react'
import { Text, View } from 'react-native'
import { MotionPressable, MotionView } from '../..'
import { demoStyles as styles } from '../style'

/**
 * @title 属性动画
 * @description MotionView 在两个属性目标间切换，卡片始终挂载，动画限制在展示区域内。
 */
export default function PropertyAnimationExample() {
  const [changed, setChanged] = useState(false)
  return (
    <View style={styles.page}>
      <MotionPressable
        accessibilityRole="button"
        style={styles.button}
        onPress={() => setChanged((value) => !value)}
      >
        <Text style={styles.buttonText}>{changed ? '恢复属性' : '改变属性'}</Text>
      </MotionPressable>
      <Text style={styles.description}>
        同时改变透明度、横纵位移、缩放和旋转。属性变化不会卸载卡片。
      </Text>
      <View style={styles.stage}>
        <MotionView
          duration={600}
          style={[styles.card, { width: 164, height: 64 }]}
          animate={{
            opacity: changed ? 0.4 : 1,
            translateX: changed ? 24 : 0,
            translateY: changed ? 8 : 0,
            scale: changed ? 0.96 : 1,
            rotate: changed ? 8 : 0,
          }}
        >
          <Text style={styles.cardText}>始终保持挂载</Text>
        </MotionView>
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        目标：
        {changed
          ? '透明度 0.4 / 位移 24、8 / 缩放 0.96 / 旋转 8°'
          : '透明度 1 / 无位移 / 缩放 1 / 旋转 0°'}
      </Text>
    </View>
  )
}
