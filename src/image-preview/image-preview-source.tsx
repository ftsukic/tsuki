import { useCallback, useContext, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { StyleSheet, View } from 'react-native'
import { ImagePreviewSourcesContext } from './context'
import type { ImagePreviewSourceProps } from './types'

const getServerSnapshot = () => false

/** Retains the thumbnail in its message; the viewer owns its separate image node. */
export function ImagePreviewSource({
  imageId,
  disabled = false,
  children,
  clipRef,
  style,
  ...props
}: ImagePreviewSourceProps) {
  const sources = useContext(ImagePreviewSourcesContext)
  if (!sources) throw new Error('ImagePreview.Source requires ImagePreview.Provider.')

  const sourceRef = useRef<View>(null)
  const { register, subscribe, isHidden } = sources
  useLayoutEffect(
    () => (disabled ? undefined : register(imageId, sourceRef, clipRef)),
    [disabled, imageId, register, clipRef],
  )
  const subscribeToImage = useCallback(
    (listener: () => void) => subscribe(imageId, listener),
    [imageId, subscribe],
  )
  const getSnapshot = useCallback(() => isHidden(imageId), [imageId, isHidden])
  const hidden = useSyncExternalStore(subscribeToImage, getSnapshot, getServerSnapshot)

  return (
    <View
      {...props}
      ref={sourceRef}
      collapsable={false}
      pointerEvents={hidden ? 'none' : props.pointerEvents}
      accessibilityElementsHidden={hidden || props.accessibilityElementsHidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : props.importantForAccessibility}
      style={[style, hidden && styles.hidden]}
    >
      {children}
    </View>
  )
}

ImagePreviewSource.displayName = 'ImagePreview.Source'

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
})
