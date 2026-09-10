import { useState } from 'react'
import { ImagePreview } from '../..'
import { Button } from '../../../button'
import { Text, View } from 'react-native'

/** @title Gesture interactions @description Pinch, double tap, zoom pan and interactive dismiss use the same surface. */
export default function GestureExample() {
  const [visible, setVisible] = useState(false)
  const [scale, setScale] = useState(1)

  return (
    <View>
      <Button onPress={() => setVisible(true)}>打开手势示例</Button>
      <Text>scale: {scale.toFixed(2)}</Text>
      <ImagePreview
        visible={visible}
        images={['https://picsum.photos/id/1039/1600/1000']}
        minZoom={0.5}
        maxZoom={3}
        doubleTapZoom={2}
        onScale={({ scale: nextScale }) => setScale(nextScale)}
        onRequestClose={() => setVisible(false)}
      />
    </View>
  )
}
