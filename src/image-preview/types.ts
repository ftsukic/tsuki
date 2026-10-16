import type { ReactNode, RefObject } from 'react'
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native'
import type { StyleResolver } from '../style'

export interface ImagePreviewImage {
  /** Defaults to image. Video playback is supplied by renderMedia. */
  type?: 'image' | 'video'
  id: string
  width: number
  height: number
  source: ImageSourcePropType
  thumbnail?: ImageSourcePropType
  original?: ImageSourcePropType
}
export interface ImagePreviewRect {
  x: number
  y: number
  width: number
  height: number
}
export type ImagePreviewCloseReason =
  'gesture' | 'image' | 'overlay' | 'close-icon' | 'back' | 'imperative' | 'removed'
export type ImagePreviewLoadState = 'idle' | 'loading' | 'loaded' | 'error'
export interface ImagePreviewImageRenderProps {
  source: ImageSourcePropType
  style: StyleProp<ImageStyle>
  onLoadStart: () => void
  onLoad: () => void
  onError: () => void
  testID?: string
}
export interface ImagePreviewMediaRenderProps {
  item: ImagePreviewImage
  /** Selected page, including its opening and closing transition. */
  active: boolean
  /** Playback is allowed only after opening, while visible and interactive. */
  playing: boolean
  style: StyleProp<ViewStyle>
  onLoad: () => void
  onError: () => void
}
export interface ImagePreviewImageAdapter {
  render: (props: ImagePreviewImageRenderProps) => ReactNode
  preload?: (source: ImageSourcePropType) => void | Promise<unknown>
}
export interface ImagePreviewImageParams {
  id: string
  item: ImagePreviewImage
  index: number
  count: number
}
export type ImagePreviewLongPressParams = ImagePreviewImageParams
export interface ImagePreviewToolbarParams extends ImagePreviewImageParams {
  close: () => void
  original: { available: boolean; status: ImagePreviewLoadState; load: () => void }
}
export type ImagePreviewRenderIndexParams = ImagePreviewImageParams
export interface ImagePreviewRef {
  swipeTo: (id: string, options?: { immediate?: boolean }) => void
  resetScale: () => void
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
  mask?: StyleProp<ViewStyle>
  pager?: StyleProp<ViewStyle>
  controls?: StyleProp<ViewStyle>
  index?: StyleProp<TextStyle>
  close?: StyleProp<ViewStyle>
  closeContent?: StyleProp<TextStyle>
  toolbar?: StyleProp<ViewStyle>
}
export type ImagePreviewStyles = StyleResolver<
  ImagePreviewProps,
  ImagePreviewStyleState,
  ImagePreviewSemanticStyles
>
export interface ImagePreviewProps extends Omit<ViewProps, 'children' | 'style'> {
  visible?: boolean
  items: readonly ImagePreviewImage[]
  activeId?: string
  closeable?: boolean
  closeOnGesture?: boolean
  showIndex?: boolean
  interactionDisabled?: boolean
  transitionDuration?: number
  getSourceRect?: (id: string) => ImagePreviewRect | null | Promise<ImagePreviewRect | null>
  imageAdapter?: ImagePreviewImageAdapter
  /** Renders video content inside the shared transform; controls belong in renderToolbar. */
  renderMedia?: (props: ImagePreviewMediaRenderProps) => ReactNode
  renderIndex?: (params: ImagePreviewImageParams) => ReactNode
  renderToolbar?: (params: ImagePreviewToolbarParams) => ReactNode
  /** Business overlays share the viewer's root Portal destination, outside its gesture scope. */
  renderOverlay?: (params: ImagePreviewImageParams) => ReactNode
  onChange?: (params: ImagePreviewImageParams) => void
  onLongPress?: (params: ImagePreviewImageParams) => void
  onRequestClose?: (reason: ImagePreviewCloseReason) => void
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
  styles?: ImagePreviewStyles
  style?: StyleProp<ViewStyle>
}
export interface ImagePreviewImperativeOptions extends Omit<ImagePreviewProps, 'visible'> {
  visible?: boolean
}
export interface ImagePreviewMethods {
  show: (options: ImagePreviewImperativeOptions) => void
  close: () => void
}

export interface ImagePreviewProviderProps {
  children?: ReactNode
}

/** Registers a mounted thumbnail as an optional opening and closing destination. */
export interface ImagePreviewSourceProps extends Omit<ViewProps, 'children'> {
  /** Matches the stable id of an ImagePreview item. */
  imageId: string
  /** Excludes an offscreen or clipped thumbnail from opening and closing destinations. */
  disabled?: boolean
  /** Native viewport that clips the thumbnail, e.g. the message list wrapper. */
  clipRef?: RefObject<View | null>
  children: ReactNode
}
