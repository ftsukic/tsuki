import React from 'react'

import { Button } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 按下反馈
 * @description 文字按钮默认使用透明度反馈，也可显式选择遮罩反馈。
 */
export default function ButtonPressFeedbackFixture() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>按下反馈</Text>
      <View style={styles.row}>
        <Button variant="text">默认透明度</Button>
        <Button
          variant="text"
          pressFeedback="overlay"
          pressedOverlayColor="rgba(25, 137, 250, 0.12)"
          hitSlop={8}
        >
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
