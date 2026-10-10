import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useAnimatedStyle } from 'react-native-reanimated'
import { Animated, Pressable } from '../../..'
import { GestureDetector, usePanGesture } from '../..'
import { styles } from '../style'

/**
 * @title 滚动内的拖动与点击
 * @description 在纵向滚动区内横向拖动卡片，比较斜向拖动、滚动取消按压与正常点击。
 */
export default function NestedScrollExample() {
  const [count, setCount] = useState(0)
  const pan = usePanGesture({ direction: 'horizontal', maxDistance: 70 })
  const { translateX } = pan
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))
  return (
    <View style={styles.page}>
      <Text style={styles.description}>
        纵向拖动应滚动；横向拖动卡片应移动。按住按钮后开始滚动，不应增加点击次数。
      </Text>
      <Text style={styles.status}>点击：{count} 次</Text>
      <ScrollView
        nestedScrollEnabled
        style={{ height: 240 }}
        contentContainerStyle={{ gap: 18, padding: 16 }}
      >
        <Text style={styles.description}>向下滚动查看内容</Text>
        <GestureDetector gesture={pan.gesture}>
          <Animated.View style={[styles.card, animatedStyle]}>
            <Text style={styles.cardText}>横向拖动</Text>
          </Animated.View>
        </GestureDetector>
        {Array.from({ length: 6 }, (_, index) => (
          <Pressable
            key={index}
            pressStyle="background"
            style={styles.button}
            onPress={() => setCount((value) => value + 1)}
          >
            <Text style={styles.buttonText}>滚动中的按钮 {index + 1}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
