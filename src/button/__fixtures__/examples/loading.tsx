import React, { useState } from 'react'
import { Button, Icon } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 图标与加载
 * @description 切换加载状态，观察图标替换、左右位置和 children 文案。
 */
export default function ButtonLoadingFixture() {
  const [loading, setLoading] = useState(false)
  const icon = <Icon name="CheckOutlined" size={16} color="#ffffff" />

  return (
    <View style={styles.container}>
      <Button variant="outlined" onPress={() => setLoading((value) => !value)}>
        {loading ? '结束加载' : '开始加载'}
      </Button>
      <Text style={styles.caption}>加载时替换普通图标，保留按钮内容，并禁止点击。</Text>
      <View style={styles.row}>
        <Button type="primary" icon={icon} loading={loading}>
          保存
        </Button>
        <Button type="primary" icon={icon} iconPosition="right" loading={loading}>
          保存
        </Button>
      </View>
      <Text style={styles.caption}>需要变化文案时，通过 children 控制。</Text>
      <Button type="primary" loading={loading} loadingType="spinner">
        {loading ? '提交中' : '提交'}
      </Button>
      <Text style={styles.caption}>纯图标按钮加载时仍保持圆形尺寸。</Text>
      <View style={styles.row}>
        <Button
          type="primary"
          shape="circle"
          icon={icon}
          loading={loading}
          accessibilityLabel="保存"
        />
        <Button disabled>禁用按钮</Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  caption: { color: '#666666', fontSize: 13 },
})
