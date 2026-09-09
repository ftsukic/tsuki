import { Button, ButtonGroup, Progress } from '../../..'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Dynamic progress
 * @description Use a Button group to increase or decrease the current percentage.
 */
export default function ProgressDynamicExample() {
  const [percentage, setPercentage] = useState(60)

  const changePercentage = (delta: number) => {
    setPercentage((current) => Math.min(100, Math.max(0, current + delta)))
  }

  return (
    <View style={styles.container}>
      <Progress percentage={percentage} />
      <Text style={styles.value}>{percentage}%</Text>
      <ButtonGroup block>
        <Button disabled={percentage === 0} onPress={() => changePercentage(-10)}>
          -10%
        </Button>
        <Button disabled={percentage === 100} onPress={() => changePercentage(10)} type="primary">
          +10%
        </Button>
      </ButtonGroup>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    justifyContent: 'center',
    minHeight: 144,
    padding: 24,
  },
  value: {
    color: '#475467',
    fontSize: 14,
    textAlign: 'center',
  },
})
