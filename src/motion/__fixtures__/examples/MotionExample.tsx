import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Animated, motionPresets, useAnimatedTransition } from '../../..'
import { Pressable } from '../../../pressable'

/**
 * @title Motion transitions
 * @description 验证 fade、scale 和 popupBottom 三种统一 transition。
 */
export default function MotionExample() {
  const [visible, setVisible] = useState(true)
  const fadeStyle = useAnimatedTransition({ visible, type: 'fade' })
  const scaleStyle = useAnimatedTransition({ visible, type: 'scale' })
  const popupStyle = useAnimatedTransition({ visible, preset: motionPresets.popupBottom })

  return (
    <View style={styles.page}>
      <Pressable onPress={() => setVisible((current) => !current)} style={styles.toggle}>
        <Text style={styles.toggleText}>{visible ? 'Hide' : 'Show'} transitions</Text>
      </Pressable>
      <View style={styles.row}>
        <Animated.View style={[styles.box, styles.fade, fadeStyle]}>
          <Text style={styles.boxText}>fade</Text>
        </Animated.View>
        <Animated.View style={[styles.box, styles.scale, scaleStyle]}>
          <Text style={styles.boxText}>scale</Text>
        </Animated.View>
      </View>
      <Animated.View style={[styles.popup, popupStyle]}>
        <Text style={styles.boxText}>popupBottom</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    gap: 16,
    minHeight: 230,
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
