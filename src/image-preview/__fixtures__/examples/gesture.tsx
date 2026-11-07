import { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { ImagePreview } from '../..'
import type { ImagePreviewRef } from '../../types'
import { Button } from '../../../button'
import { createLocalPhotos } from './local-photo-data'
import PreviewToolbar from '../../../image-preview/__fixtures__/examples/preview-toolbar'

const ITEMS = createLocalPhotos('gesture')

/** @title 手势交互 @description 使用本地图片验证缩放、触点锚定的下拉恢复与关闭。 */
export default function GestureExample() {
  const previewRef = useRef<ImagePreviewRef>(null)
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setVisible(true)}>打开手势示例</Button>
      <Text>
        使用本地图片独立复现：从不同位置斜向下拖并观察图片跟手缩小；短拖松开或反向拖动可恢复。放大后先拖到纵向边界再继续下拉，也可用第二指中断，或在恢复中再次拖动。
      </Text>
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
