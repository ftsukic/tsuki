import { Button, Popover } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

const actions = [{ text: '编辑' }, { text: '分享' }]

/**
 * @title Popover themes
 * @description Compare the light and dark visual themes of Popover.
 */
export default function PopoverThemeFixture() {
  return (
    <View style={styles.container}>
      <Popover actions={actions} theme="light">
        <Button variant="outline">浅色</Button>
      </Popover>
      <Popover actions={actions} theme="dark">
        <Button variant="outline">深色</Button>
      </Popover>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
})
