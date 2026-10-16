import { useState } from 'react'
import { Image, View } from 'react-native'
import { ImagePreview } from '../..'
import type { ImagePreviewImageAdapter } from '../../types'
import { Button } from '../../../button'
import { NETWORK_PHOTOS } from '../../../image-preview/__fixtures__/examples/network-photo-data'
import PreviewToolbar from '../../../image-preview/__fixtures__/examples/preview-toolbar'

const ITEMS = NETWORK_PHOTOS.slice(3, 6)
const imageAdapter: ImagePreviewImageAdapter = {
  render: ({ source, style, onLoadStart, onLoad, onError, testID }) => (
    <Image
      source={source}
      style={style}
      resizeMode="contain"
      testID={testID}
      onLoadStart={onLoadStart}
      onLoad={onLoad}
      onError={onError}
    />
  ),
  preload: (source) => {
    // RN Image.prefetch only accepts a URI; a FastImage adapter can preload the complete source.
    if (!Array.isArray(source) && typeof source === 'object' && source?.uri && !source.headers) {
      return Image.prefetch(source.uri)
    }
  },
}

/** @title 自定义图片 adapter @description 同一 adapter 处理显示与邻页预加载，图片尺寸和加载反馈由查看器管理。 */
export default function CustomRenderer() {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  return (
    <View>
      <Button onPress={() => setVisible(true)}>打开自定义图片</Button>
      <ImagePreview
        visible={visible}
        items={ITEMS}
        activeId={activeId}
        imageAdapter={imageAdapter}
        closeable
        renderToolbar={(params) => <PreviewToolbar {...params} />}
        onChange={({ id }) => setActiveId(id)}
        onRequestClose={() => setVisible(false)}
      />
    </View>
  )
}
