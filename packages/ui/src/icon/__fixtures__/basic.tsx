import { StyleSheet, Text, View } from 'react-native'
import { ConfigProvider, Icon } from '../..'

/**
 * @title Icon gallery
 * @description Use Ant Design SVG definitions with native-style size, color and touch targets.
 */
export default function IconBasicFixture() {
  return (
    <ConfigProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>Outlined icons</Text>
        <View style={styles.row}>
          <Icon name="CheckOutlined" size={24} color="#07c160" />
          <Icon name="InfoCircleOutlined" size={24} color="#1989fa" />
          <Icon name="WarningOutlined" size={24} color="#ff976a" />
          <Icon name="CloseCircleOutlined" size={24} color="#ee0a24" />
        </View>
        <Text style={styles.heading}>Touchable icon</Text>
        <Icon
          name="SettingOutlined"
          size={28}
          color="#333333"
          touchableSize={44}
          onPress={() => undefined}
          accessibilityLabel="Open settings"
        />
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
})
