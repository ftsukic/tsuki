import { Switch } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Switch semantic styles
 * @description Customize track and indicator geometry, state colors and loading layout.
 */
export default function SwitchSemanticExample() {
  const [enabled, setEnabled] = useState(false)
  return (
    <View style={styles.container}>
      <Text>自定义尺寸：{enabled ? '开启' : '关闭'}</Text>
      <Switch
        accessibilityLabel="自定义轨道与滑块"
        value={enabled}
        onChange={setEnabled}
        styles={({ state }) => ({
          track: {
            width: 64,
            height: 32,
            borderRadius: 16,
            backgroundColor: state.active ? '#7232DD' : '#D9D9D9',
          },
          indicator: { width: 28, height: 28, borderRadius: 14 },
        })}
      />
      <Text>加载区域</Text>
      <Switch
        accessibilityLabel="自定义加载区域"
        loading
        styles={{
          indicator: { backgroundColor: '#F0F5FF' },
          loading: { borderRadius: 10, backgroundColor: '#E6F4FF' },
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({ container: { gap: 12 } })
