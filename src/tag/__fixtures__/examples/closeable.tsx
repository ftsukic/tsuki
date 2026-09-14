import { Tag } from '@ftsukic/tsuki'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title 可关闭和禁用
 * @description closeable 只发出 onClose，是否卸载由外层状态控制；disabled 会禁用关闭图标。
 */
export default function TagCloseableExample() {
  const [visible, setVisible] = useState(true)

  return (
    <View style={{ alignItems: 'flex-start', gap: 12 }}>
      {visible ? (
        <Tag closeable type="primary" onClose={() => setVisible(false)}>
          点击关闭
        </Tag>
      ) : (
        <Text>标签已由外层状态卸载</Text>
      )}
      <Tag closeable disabled type="danger" onClose={() => undefined}>
        禁用关闭
      </Tag>
    </View>
  )
}
