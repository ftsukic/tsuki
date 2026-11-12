import { useState } from 'react'
import { ActionSheet, Button } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

/**
 * @title 长操作列表
 * @description 操作列表滚动，标题和取消区保持可见；打开后可以增加操作。
 */
export default function ActionSheetLongListFixture() {
  const [visible, setVisible] = useState(false)
  const [count, setCount] = useState(3)
  const [selected, setSelected] = useState('')
  return (
    <View style={{ gap: 10 }}>
      <Button
        onPress={() => {
          setCount(3)
          setVisible(true)
        }}
      >
        打开动态操作列表
      </Button>
      {selected ? <Text>已选择：{selected}</Text> : null}
      <ActionSheet
        visible={visible}
        title="选择操作"
        actions={[
          { name: '增加到 30 项', callback: () => setCount(30) },
          ...Array.from({ length: count }, (_, index) => ({
            name: `操作 ${index + 1}`,
            subname: '操作说明，可检查长内容与字体放大后的滚动效果。',
          })),
        ]}
        closeOnAction={false}
        onSelect={(action, index) => {
          if (index === 0) return
          setSelected(String(action.name))
          setVisible(false)
        }}
        onClose={() => setVisible(false)}
        styles={{ cancel: { backgroundColor: '#e6f4ff' } }}
      />
    </View>
  )
}
