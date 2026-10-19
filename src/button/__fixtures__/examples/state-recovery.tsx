import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '@ftsukic/tsuki'

/**
 * @title 禁用与加载恢复
 * @description 切换禁用或加载状态，观察按钮恢复正常透明度，并通过点击次数确认交互。
 */
export default function ButtonStateRecoveryFixture() {
  const [disabled, setDisabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
  const handlePress = () => setCount((value) => value + 1)

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button onPress={() => setDisabled((value) => !value)}>
          {disabled ? '解除禁用' : '设为禁用'}
        </Button>
        <Button onPress={() => setLoading((value) => !value)}>
          {loading ? '结束加载' : '开始加载'}
        </Button>
      </View>
      <Text>
        禁用：{disabled ? '是' : '否'}；加载：{loading ? '是' : '否'}
      </Text>
      <Text>解除禁用并结束加载后，按钮应恢复正常颜色；点击下方按钮可增加计数。</Text>
      <Button type="primary" disabled={disabled} loading={loading} onPress={handlePress}>
        默认覆盖层反馈
      </Button>
      <Button
        type="primary"
        pressFeedback="opacity"
        disabled={disabled}
        loading={loading}
        onPress={handlePress}
      >
        透明度反馈
      </Button>
      <Text>点击次数：{count}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
})
