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
      <Input
        bordered
        defaultValue="中文 Agj 123"
        maxLength={40}
        showWordLimit
        addonBefore={<Text>自定义</Text>}
        suffix={<Text>单位</Text>}
        style={{ width: '90%' }}
        styles={{ container: { borderRadius: 12 }, suffix: { marginLeft: 8 } }}
      />
      <Input
        multiline
        autoSize={{ minRows: 2, maxRows: 4 }}
        defaultValue="中文 Agj\n第二行"
        styles={{ input: { fontSize: 24, lineHeight: 34 } }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
})
