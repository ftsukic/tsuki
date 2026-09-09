import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Animated, motionPresets, useAnimatedTransition } from '../../..'
import { Pressable } from '../../../pressable'

/**
 * @title Motion presets
 * @description 使用 dialog、drawerLeft 和 drawerRight preset 验证可复用动画配置。
 */
export default function PresetsExample() {
  const [visible, setVisible] = useState(true)
  const dialogStyle = useAnimatedTransition({ visible, preset: motionPresets.dialog })
  const leftStyle = useAnimatedTransition({ visible, preset: motionPresets.drawerLeft })
  const rightStyle = useAnimatedTransition({ visible, preset: motionPresets.drawerRight })

  return (
    <View style={styles.page}>
      <Pressable onPress={() => setVisible((current) => !current)} style={styles.toggle}>
        <Text style={styles.toggleText}>{visible ? 'Hide' : 'Show'} presets</Text>
      </Pressable>
      <View style={styles.stage}>
        <Animated.View style={[styles.drawer, styles.left, leftStyle]}>
          <Text style={styles.label}>drawerLeft</Text>
        </Animated.View>
        <Animated.View style={[styles.dialog, dialogStyle]}>
          <Text style={styles.label}>dialog</Text>
        </Animated.View>
        <Animated.View style={[styles.drawer, styles.right, rightStyle]}>
          <Text style={styles.label}>drawerRight</Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    gap: 16,
    minHeight: 220,
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
  stage: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 100,
  },
  drawer: {
    alignItems: 'center',
    borderRadius: 10,
    height: 64,
    justifyContent: 'center',
    width: 96,
  },
  left: {
    backgroundColor: '#7f56d9',
  },
  right: {
    backgroundColor: '#d444f1',
  },
  dialog: {
    alignItems: 'center',
    backgroundColor: '#344054',
    borderRadius: 16,
    height: 84,
    justifyContent: 'center',
    width: 112,
  },
  label: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
})
