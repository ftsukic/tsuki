import { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { ImagePreview } from '../..'
import type { ImagePreviewRef } from '../../types'
import { Button } from '../../../button'
import { NETWORK_PHOTOS } from '../../../image-preview/__fixtures__/examples/network-photo-data'
import PreviewToolbar from '../../../image-preview/__fixtures__/examples/preview-toolbar'

const ITEMS = NETWORK_PHOTOS.slice(5, 8)

/** @title 手势交互 @description 横竖图切换后验证双击、双指缩放、放大拖动、短拖恢复和下拉关闭。 */
export default function GestureExample() {
  const previewRef = useRef<ImagePreviewRef>(null)
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setVisible(true)}>打开手势示例</Button>
      <Text>双击或双指缩放，放大后拖动查看；切换横竖图后检查边界，下拉关闭。</Text>
      <ImagePreview
        ref={previewRef}
        visible={visible}
        items={ITEMS}
        activeId={activeId}
        closeable
        renderToolbar={(params) => <PreviewToolbar {...params} />}
        onChange={({ id }) => setActiveId(id)}
        onRequestClose={() => setVisible(false)}
      />
    </View>
  )
}
