import React from 'react'
import { Button } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 尺寸与布局
 * @description 比较四种尺寸、块级按钮和文字按钮布局。
 */
export default function ButtonSizesFixture() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>四种尺寸</Text>
      <View style={styles.row}>
        <Button type="primary" size="large">
          大号
        </Button>
        <Button type="primary">普通</Button>
        <Button type="primary" size="small">
          小号
        </Button>
        <Button type="primary" size="mini">
          迷你
        </Button>
      </View>
      <Text style={styles.heading}>占满可用宽度</Text>
      <Button type="primary" block>
        块级按钮
      </Button>
      <Text style={styles.heading}>块级文字按钮</Text>
      <Button type="primary" variant="text" block>
        查看全部
      </Button>
      <Text style={styles.heading}>文字按钮按内容布局</Text>
      <View style={styles.row}>
        <Button type="primary" variant="text" size="small">
          小号文字
        </Button>
        <Button type="primary" variant="text">
          普通文字
        </Button>
        <Button type="primary" variant="text" size="large">
          大号文字
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  heading: { color: '#333333', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
})
