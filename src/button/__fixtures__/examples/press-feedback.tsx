import React from 'react'

import { Button } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Press feedback
 * @description Text buttons keep opacity feedback by default and can opt into an explicit overlay.
 */
export default function ButtonPressFeedbackFixture() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>按下反馈</Text>
      <View style={styles.row}>
        <Button variant="text">默认透明度</Button>
        <Button variant="text" pressFeedback="overlay" pressedOverlayColor="#1989FA" hitSlop={8}>
          显式覆盖层
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
})
