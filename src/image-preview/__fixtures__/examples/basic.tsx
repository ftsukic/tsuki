import { useState } from 'react'
import { View } from 'react-native'
import { ImagePreview } from '../..'
import { Button } from '../../../button'
import { NETWORK_PHOTOS } from '../../../image-preview/__fixtures__/examples/network-photo-data'
import PreviewToolbar from '../../../image-preview/__fixtures__/examples/preview-toolbar'

const ITEMS = NETWORK_PHOTOS.slice(0, 3)

/** @title 基础图片预览 @description 通过稳定图片 ID 打开三张图片，使用统一工具栏与关闭按钮。 */
export default function Basic() {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  return (
    <View>
      <Button onPress={() => setVisible(true)}>打开图片预览</Button>
      <ImagePreview
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
