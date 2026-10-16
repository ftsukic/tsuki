import { View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { ImagePreviewItem } from './image-preview-item'
import { containRect } from './geometry'
import type {
  ImagePreviewImage,
  ImagePreviewRect,
  ImagePreviewProps,
  ImagePreviewLoadState,
} from './types'
/** A page keeps the same image tree for its entire open, gesture and close lifecycle. */
export function ImagePreviewPage({
  item,
  width,
  height,
  pageWidth,
  selected,
  rect,
  clip,
  opacity,
  hidden,
  imageAdapter,
  renderMedia,
  active,
  playing,
  originalRequested,
  originalAttempt,
  onOriginalStateChange,
  onDisplayStateChange,
}: {
  item: ImagePreviewImage
  width: number
  height: number
  pageWidth: number
  selected: SharedValue<string>
  rect: SharedValue<ImagePreviewRect>
  clip: SharedValue<ImagePreviewRect>
  opacity: SharedValue<number>
  hidden: SharedValue<boolean>
  imageAdapter: ImagePreviewProps['imageAdapter']
  renderMedia: ImagePreviewProps['renderMedia']
  active: boolean
  playing: boolean
  originalRequested: boolean
  originalAttempt: number
  onDisplayStateChange: (id: string, status: ImagePreviewLoadState) => void
  onOriginalStateChange: (id: string, status: ImagePreviewLoadState) => void
}) {
  const base = containRect(item, width, height)
  const frame = useAnimatedStyle(() => {
    const current = selected.value === item.id ? rect.value : base
    const bounds = selected.value === item.id ? clip.value : { x: 0, y: 0 }
    return {
      left: base.x - bounds.x,
      top: base.y - bounds.y,
      opacity:
        hidden.value && selected.value !== item.id
          ? 0
          : selected.value === item.id
            ? opacity.value
            : 1,
      transform: [
        { translateX: current.x + current.width / 2 - width / 2 },
        { translateY: current.y + current.height / 2 - height / 2 },
        { scaleX: current.width / base.width },
        { scaleY: current.height / base.height },
      ],
    }
  }, [selected, item.id, base, height, hidden, opacity, rect, width, clip])
  const clippingStyle = useAnimatedStyle(() => {
    const bounds = selected.value === item.id ? clip.value : { x: 0, y: 0, width, height }
    return { left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height }
  }, [selected, item.id, clip, width, height])
  const imageStyle = useAnimatedStyle(() => {
    const current = selected.value === item.id ? rect.value : base
    const sx = current.width / base.width
    const sy = current.height / base.height
    const scale = Math.max(sx, sy)
    return { transform: [{ scaleX: scale / sx }, { scaleY: scale / sy }] }
  }, [selected, item.id, base, rect])
  return (
    <View style={{ width: pageWidth, height }}>
      <Animated.View
        style={[{ position: 'absolute', overflow: 'hidden' }, clippingStyle]}
        testID={`image-preview-page-${item.id}`}
      >
        <Animated.View
          testID={`image-preview-frame-${item.id}`}
          style={[
            {
              position: 'absolute',
              left: base.x,
              top: base.y,
              width: base.width,
              height: base.height,
              overflow: 'hidden',
            },
            frame,
          ]}
        >
          <Animated.View style={[{ width: '100%', height: '100%' }, imageStyle]}>
            <ImagePreviewItem
              item={item}
              imageAdapter={imageAdapter}
              renderMedia={renderMedia}
              active={active}
              playing={playing}
              originalRequested={originalRequested}
              originalAttempt={originalAttempt}
              onOriginalStateChange={onOriginalStateChange}
              onDisplayStateChange={onDisplayStateChange}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  )
}
