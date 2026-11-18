import { Switch } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Switch custom colors
 * @description Customize active and inactive track colors for a themed control.
 */
export default function SwitchColorsExample() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>绿色开关</Text>
        <Switch
          accessibilityLabel="绿色开关"
          activeColor="#07C160"
          defaultValue
          inactiveColor="#DCDEE0"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>紫色开关</Text>
        <Switch accessibilityLabel="紫色开关" activeColor="#7232DD" inactiveColor="#E8DEF9" />
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
    justifyContent: 'space-between',
  },
})
