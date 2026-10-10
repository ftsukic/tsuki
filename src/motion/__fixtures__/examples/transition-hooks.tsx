import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Animated, motionPresets, useAnimatedTransition } from '../..'
import { Pressable } from '../../../pressable'

/**
 * @title 过渡 Hook
 * @description 使用 Hook 同时展示淡入、缩放淡入和底部滑入，由调用方管理节点。
 */
export default function TransitionHooksExample() {
  const [visible, setVisible] = useState(true)
  const fadeStyle = useAnimatedTransition({ visible, type: 'fade' })
  const scaleStyle = useAnimatedTransition({ visible, type: 'scale', fade: true })
  const popupStyle = useAnimatedTransition({
    visible,
    preset: motionPresets.popupBottom,
    distance: 96,
  })

  return (
    <View style={styles.page}>
      <Pressable onPress={() => setVisible((current) => !current)} style={styles.toggle}>
        <Text style={styles.toggleText}>{visible ? '隐藏' : '显示'}过渡</Text>
      </Pressable>
      <View style={styles.row}>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          accessibilityElementsHidden={!visible}
          importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
          style={[styles.box, styles.fade, fadeStyle]}
        >
          <Text style={styles.boxText}>fade</Text>
        </Animated.View>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          accessibilityElementsHidden={!visible}
          importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
          style={[styles.box, styles.scale, scaleStyle]}
        >
          <Text style={styles.boxText}>scale-fade</Text>
        </Animated.View>
      </View>
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
        style={[styles.popup, popupStyle]}
      >
        <Text style={styles.boxText}>popupBottom</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    gap: 16,
    minHeight: 230,
    overflow: 'hidden',
    padding: 20,
  },
  toggle: {
    alignSelf: 'flex-start',
    backgroundColor: '#101828',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  box: {
    alignItems: 'center',
    borderRadius: 12,
    height: 72,
    justifyContent: 'center',
    width: 116,
  },
  fade: {
    backgroundColor: '#1677ff',
  },
  scale: {
    backgroundColor: '#12b76a',
  },
  popup: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#f79009',
    borderRadius: 12,
    height: 64,
    justifyContent: 'center',
  },
  boxText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
})
