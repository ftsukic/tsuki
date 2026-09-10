import { useState } from 'react'
import { ImagePreview } from '../..'
import { Button } from '../../../button'
import { View } from 'react-native'

/** @title Basic image preview @description Open three images with index and close controls. */
export default function Basic() {
  const [visible, setVisible] = useState(false)
  const images = [
    'https://picsum.photos/id/1015/900/1200',
    'https://picsum.photos/id/1016/1200/800',
    'https://picsum.photos/id/1025/900/900',
  ]

  return (
    <View>
      <Button onPress={() => setVisible(true)}>打开图片预览</Button>
      <ImagePreview
        visible={visible}
        images={images}
        closeable
        showIndex
        onRequestClose={() => setVisible(false)}
        onClosed={() => setVisible(false)}
      />
    </View>
  )
}
