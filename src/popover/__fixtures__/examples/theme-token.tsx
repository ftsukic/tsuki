import { Button, ConfigProvider, Popover } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Theme tokens
 * @description Customize Popover geometry through ConfigProvider component tokens.
 */
export default function PopoverThemeTokenFixture() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Popover: {
            actionHeight: 50,
            actionWidth: 144,
            borderRadius: 14,
          },
        },
      }}
    >
      <View style={styles.container}>
        <Popover actions={[{ text: '主题化操作' }]}>
          <Button variant="outline">主题 token</Button>
        </Popover>
        <Text style={styles.caption}>宽度、行高和圆角来自 Popover component token。</Text>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  caption: {
    color: '#667085',
    fontSize: 13,
  },
  container: {
    gap: 10,
  },
})
