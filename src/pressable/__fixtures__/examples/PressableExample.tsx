import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Pressable } from '../../..'

/**
 * @title Press feedback
 * @description 验证 opacity 和 scale 两种统一点击反馈。
 */
export default function PressableExample() {
  const [count, setCount] = useState(0)

  return (
    <View style={styles.page}>
      <Text style={styles.description}>点击任意按钮，观察 pressed feedback。次数：{count}</Text>
      <View style={styles.row}>
        <Pressable
          pressStyle="opacity"
          onPress={() => setCount((value) => value + 1)}
          style={styles.opacityButton}
        >
          <Text style={styles.buttonText}>opacity</Text>
        </Pressable>
        <Pressable
          pressStyle="scale"
          onPress={() => setCount((value) => value + 1)}
          style={styles.scaleButton}
        >
          <Text style={styles.buttonText}>scale</Text>
        </Pressable>
      </View>
      <Pressable
        pressStyle="none"
        onPress={() => setCount((value) => value + 1)}
        style={styles.noneButton}
      >
        <Text style={styles.noneText}>none</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    gap: 14,
    minHeight: 180,
    padding: 20,
  },
  description: {
    color: '#667085',
    lineHeight: 21,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  opacityButton: {
    alignItems: 'center',
    backgroundColor: '#1677ff',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  scaleButton: {
    alignItems: 'center',
    backgroundColor: '#12b76a',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  noneButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#d0d5dd',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  noneText: {
    color: '#344054',
    fontWeight: '600',
  },
})
