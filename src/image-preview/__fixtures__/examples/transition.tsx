import { useCallback, useRef, useState } from 'react'
import { ImagePreview } from '../..'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
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
  const [startPosition, setStartPosition] = useState(0)
  const [sourceRect, setSourceRect] = useState<ImagePreviewRect | null>(null)

  const open = (index: number) => {
    refs.current[index]?.measureInWindow((x, y, width, height) => {
      const rect = { x, y, width, height }
      setSourceRect(rect)
      setStartPosition(index)
      setVisible(true)
    })
  }

  const getSourceRect = useCallback(
    (index: number) =>
      new Promise<ImagePreviewRect | null>((resolve) => {
        const image = refs.current[index]
        if (!image) {
          resolve(null)
          return
        }
        image.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }))
      }),
    [],
  )

  return (
    <View>
      <View style={styles.row}>
        {images.map((image, index) => (
          <Pressable key={image} accessibilityRole="button" onPress={() => open(index)}>
            <Image
              ref={(value) => {
                refs.current[index] = value
              }}
              source={{ uri: image }}
              style={styles.thumbnail}
            />
            <Text style={styles.label}>{`第 ${index + 1} 张`}</Text>
          </Pressable>
        ))}
      </View>
      <ImagePreview
        getSourceRect={getSourceRect}
        visible={visible}
        images={images}
        startPosition={startPosition}
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
  label: { textAlign: 'center' },
  thumbnail: { height: 96, width: 72 },
})
