import { useState } from 'react'
import { ImagePreview } from '../..'
import { Button } from '../../../button'
import { Image, View } from 'react-native'
import type { ImageSourcePropType, ImageStyle, StyleProp } from 'react-native'
import { Flex, Text } from '@ftsukic/tsuki'

const IMAGES = ['https://picsum.photos/id/1025/900/900', 'https://picsum.photos/id/1015/900/1200']

interface CustomImageProps {
  source: ImageSourcePropType
  style: StyleProp<ImageStyle>
  onLoadStart: () => void
  onLoad: (dimensions?: { width: number; height: number }) => void
  onLoadEnd: () => void
  onError: () => void
}

function CustomImage({ source, style, onLoadStart, onLoad, onLoadEnd, onError }: CustomImageProps) {
  return (
    <Image
      source={source}
      style={style}
      resizeMode="contain"
      onLoadStart={onLoadStart}
      onLoad={(event) =>
        onLoad({
          width: event.nativeEvent.source.width,
          height: event.nativeEvent.source.height,
        })
      }
      onLoadEnd={onLoadEnd}
      onError={onError}
    />
  )
}

/** @title Custom image renderer @description Wrap React Native Image while forwarding ImagePreview's lifecycle context. */
export default function CustomRenderer() {
  const [visible, setVisible] = useState(false)
  const [toolbarPressCount, setToolbarPressCount] = useState(0)

  return (
    <View>
      <Button onPress={() => setVisible(true)}>打开自定义图片</Button>
      <ImagePreview
        visible={visible}
        images={IMAGES}
        closeable
        showIndex
        showIndicators
        onRequestClose={() => setVisible(false)}
        onClosed={() => setVisible(false)}
        renderImage={(image, index, { source, style, onLoadStart, onLoad, onLoadEnd, onError }) => (
          <CustomImage
            key={String(image) + '-' + index}
            source={source}
            style={style}
            onLoadStart={onLoadStart}
            onLoad={onLoad}
            onLoadEnd={onLoadEnd}
            onError={onError}
          />
        )}
        renderToolbar={() => (
          <Flex align="center" justify="flex-end" style={{ minHeight: 48, marginHorizontal: 20 }}>
            <Text style={{ color: '#fff' }}>Toolbar</Text>
            <Button onPress={() => setToolbarPressCount((count) => count + 1)}>
              {toolbarPressCount > 0 ? `Clicked ${toolbarPressCount}` : 'Toolbar Action'}
            </Button>
          </Flex>
        )}
      />
    </View>
  )
}
