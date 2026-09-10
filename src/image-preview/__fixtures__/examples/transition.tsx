import { useRef, useState } from 'react'
import { ImagePreview } from '../..'
import { Button } from '../../../button'
import { Image, StyleSheet, View } from 'react-native'
import type { ImagePreviewRect } from '../..'

/** @title Thumbnail transition @description Measure the tapped thumbnail and animate to the fullscreen image. */
export default function Transition() {
  const images = [
    'https://picsum.photos/id/1043/900/1200',
    'https://picsum.photos/id/1044/1200/800',
    'https://picsum.photos/id/1045/900/900',
  ]
  const refs = useRef<Array<Image | null>>([])
  const [visible, setVisible] = useState(false)
  const [sourceRect, setSourceRect] = useState<ImagePreviewRect | null>(null)

  const open = (index: number) => {
    refs.current[index]?.measureInWindow((x, y, width, height) => {
      const rect = { x, y, width, height }
      setSourceRect(rect)
      setVisible(true)
    })
  }

  return (
    <View>
      <View style={styles.row}>
        {images.map((image, index) => (
          <Image
            key={image}
            ref={(value) => {
              refs.current[index] = value
            }}
            source={{ uri: image }}
            style={styles.thumbnail}
          />
        ))}
      </View>
      <Button onPress={() => open(0)}>从第一张打开</Button>
      <ImagePreview
        visible={visible}
        images={images}
        startPosition={0}
        sourceRect={sourceRect}
        closeable
        onRequestClose={() => setVisible(false)}
        onClosed={() => setVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  thumbnail: { height: 96, width: 72 },
})
