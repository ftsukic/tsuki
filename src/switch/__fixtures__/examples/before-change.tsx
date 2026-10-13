import { Button, Switch } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Switch async beforeChange
 * @description Confirm an asynchronous state transition before committing the value.
 */
export default function SwitchBeforeChangeExample() {
  const [status, setStatus] = useState('等待操作')
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <View style={styles.container}>
      <Switch
        accessibilityLabel="异步确认开关"
        disabled={disabled}
        loading={loading}
        beforeChange={async () => {
          setStatus('确认中...')
          await new Promise((resolve) => setTimeout(resolve, 1500))
          return true
        }}
        onChange={(nextValue) => setStatus(nextValue ? '状态为开启' : '状态为关闭')}
      />
      <Text style={styles.status}>{status}</Text>
      <Button
        onPress={() => {
          setDisabled(!disabled)
          setStatus(disabled ? '已恢复操作' : '已禁用，待确认请求失效')
        }}
      >
        {disabled ? '恢复操作' : '禁用开关'}
      </Button>
      <Button
        onPress={() => {
          setLoading(!loading)
          setStatus(loading ? '加载结束' : '加载中，待确认请求失效')
        }}
      >
        {loading ? '结束加载' : '进入加载'}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  status: {
    color: '#68788D',
    fontSize: 13,
  },
})
