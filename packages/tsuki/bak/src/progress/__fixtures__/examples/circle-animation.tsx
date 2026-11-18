import { Button, ButtonGroup, Progress } from '../../..'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Circle animation
 * @description Change the circle percentage to preview the animated number and ring updates.
 */
export default function ProgressCircleAnimationExample() {
  const [percentage, setPercentage] = useState(40)

  const changePercentage = (delta: number) => {
    setPercentage((current) => Math.min(100, Math.max(0, current + delta)))
  }

  return (
    <View style={styles.container}>
      <Progress percentage={percentage} size={104} type="circle" />
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
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    minHeight: 192,
    padding: 24,
  },
  value: {
    color: '#475467',
    fontSize: 14,
    textAlign: 'center',
  },
})
