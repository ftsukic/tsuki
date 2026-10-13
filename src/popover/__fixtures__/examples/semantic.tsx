import { Button, Popover, Text as TsukiText } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Semantic styles
 * @description Customize the Popover reference, content and action slots.
 */
export default function PopoverSemanticFixture() {
  return (
    <View style={styles.container}>
      <Popover
        actions={[{ text: '强调操作' }, { text: <TsukiText>次要操作</TsukiText> }]}
        styles={({ state }) => ({
          item: { minHeight: state.visible ? 50 : 44 },
          itemContent: { fontWeight: '600' },
          root: { backgroundColor: '#eff6ff', borderColor: '#1989fa', borderWidth: 1 },
          container: { paddingVertical: 4 },
          reference: { opacity: state.visible ? 1 : 0.82 },
        })}
      >
        <Button>语义样式</Button>
      </Popover>
      <Popover
        accessibilityLabel="打开自定义 reference 操作"
        actions={[{ text: '编辑', accessibilityLabel: '编辑内容' }]}
      >
        <VisualReference />
      </Popover>
      <Text style={styles.caption}>
        root 统一控制浮层背景；普通展示 reference 支持点击和无障碍激活。
      </Text>
    </View>
  )
}

function VisualReference() {
  return (
    <View style={styles.reference}>
      <Text>自定义 reference</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  reference: { borderColor: '#1989fa', borderWidth: 1, padding: 10 },
  caption: {
    color: '#667085',
    fontSize: 13,
  },
  container: {
    gap: 10,
  },
})
