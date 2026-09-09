import { Switch } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Switch async beforeChange
 * @description Confirm an asynchronous state transition before committing the value.
 */
export default function SwitchBeforeChangeExample() {
  const [status, setStatus] = useState('等待操作')

  return (
    <View style={styles.container}>
      <Switch
        accessibilityLabel="异步确认开关"
        beforeChange={async (nextValue) => {
          setStatus('确认中...')
          await new Promise((resolve) => setTimeout(resolve, 350))
          setStatus(nextValue ? '已确认开启' : '已确认关闭')
          return true
        }}
        onChange={(nextValue) => setStatus(nextValue ? '状态为开启' : '状态为关闭')}
      />
      <Text style={styles.status}>{status}</Text>
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
