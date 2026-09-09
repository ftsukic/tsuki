import { Input } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Input size and layout
 * @description 展示尺寸、前后缀和输入框外侧 addon 的组合布局。
 */
export default function InputLayoutFixture() {
  return (
    <View style={styles.container}>
      <Input size="small" bordered prefix={<Text>$</Text>} addonBefore="金额" />
      <Input size="large" bordered suffix={<Text>kg</Text>} addonAfter="重量" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
})
