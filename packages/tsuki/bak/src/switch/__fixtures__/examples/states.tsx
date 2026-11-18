import { Switch } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Switch states and sizes
 * @description Compare the default, checked, disabled, loading and named size states.
 */
export default function SwitchStatesExample() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>默认</Text>
        <Switch accessibilityLabel="默认开关" />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>checked</Text>
        <Switch accessibilityLabel="已开启" defaultValue />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>disabled</Text>
        <Switch accessibilityLabel="禁用开关" defaultValue disabled />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>loading</Text>
        <Switch accessibilityLabel="加载中的开关" defaultValue loading />
      </View>
      <View style={styles.sizes}>
        <Text style={styles.label}>尺寸</Text>
        <Switch accessibilityLabel="小尺寸" size="small" />
        <Switch accessibilityLabel="中尺寸" size="medium" />
        <Switch accessibilityLabel="大尺寸" size="large" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  label: {
    color: '#344054',
    fontSize: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  sizes: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
})
