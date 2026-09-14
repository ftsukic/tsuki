import type { ReactNode } from 'react'
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native'
import type { StyleResolver } from '../style'

export type ImagePreviewImage =
  | string
  | ImageSourcePropType
  | {
      source: string | ImageSourcePropType
      width?: number
      height?: number
      key?: string | number
    }

export interface ImagePreviewRect {
  x: number
  y: number
  width: number
  height: number
}

export type ImagePreviewCloseReason =
  'gesture' | 'image' | 'overlay' | 'close-icon' | 'back' | 'imperative'

export interface ImagePreviewRef {
  swipeTo: (index: number, options?: { immediate?: boolean }) => void
  resetScale: () => void
}

export interface ImagePreviewRenderIndexParams {
  index: number
  total: number
}

export interface ImagePreviewRenderImageContext {
  source: ImageSourcePropType
  style: StyleProp<ImageStyle>
  mode: 'preview' | 'transition'
  onLoadStart: () => void
  onLoad: (dimensions?: { width: number; height: number }) => void
  onLoadEnd: () => void
  onError: () => void
}

export interface ImagePreviewStyleState {
  visible: boolean
  activeIndex: number
  total: number
  opening: boolean
  closing: boolean
}

export interface ImagePreviewSemanticStyles {
  root?: StyleProp<ViewStyle>
  overlay?: StyleProp<ViewStyle>
  pager?: StyleProp<ViewStyle>
  controls?: StyleProp<ViewStyle>
  index?: StyleProp<TextStyle>
  closeButton?: StyleProp<ViewStyle>
  closeLabel?: StyleProp<TextStyle>
  indicators?: StyleProp<ViewStyle>
  indicator?: StyleProp<ViewStyle>
  activeIndicator?: StyleProp<ViewStyle>
}

export type ImagePreviewStyles = StyleResolver<
  ImagePreviewProps,
  ImagePreviewStyleState,
  ImagePreviewSemanticStyles
>

export interface ImagePreviewProps extends Omit<ViewProps, 'children' | 'style'> {
  visible?: boolean
  images: ImagePreviewImage[]
  startPosition?: number
  loop?: boolean
  showIndex?: boolean
  showIndicators?: boolean
  minZoom?: number
  maxZoom?: number
  doubleTapZoom?: number
  closeable?: boolean
  closeOnPressImage?: boolean
  closeOnPressOverlay?: boolean
  closeOnGesture?: boolean
  sourceRect?: ImagePreviewRect | null
  getSourceRect?: (index: number) => ImagePreviewRect | null | Promise<ImagePreviewRect | null>
  swipeDuration?: number
  transitionDuration?: number
  renderImage?: (
    image: ImagePreviewImage,
    index: number,
    context: ImagePreviewRenderImageContext,
  ) => ReactNode
  renderIndex?: (params: ImagePreviewRenderIndexParams) => ReactNode
  renderToolbar?: (params: ImagePreviewRenderIndexParams) => ReactNode
  styles?: ImagePreviewStyles
  onChange?: (index: number) => void
  onScale?: (params: { index: number; scale: number }) => void
  onRequestClose?: (reason: ImagePreviewCloseReason) => void
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
  style?: StyleProp<ViewStyle>
}

export interface ImagePreviewImperativeOptions extends Omit<ImagePreviewProps, 'visible'> {
  visible?: boolean
}

export interface ImagePreviewMethods {
  show: (options: ImagePreviewImperativeOptions) => void
  close: () => void
}
