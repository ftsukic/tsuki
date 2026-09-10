import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { BackHandler, Dimensions, FlatList, Platform, Pressable, Text, View } from 'react-native'
import type { LayoutChangeEvent, ListRenderItemInfo } from 'react-native'
import { scheduleOnRN } from 'react-native-worklets'
import { Animated, useAnimatedStyle, useSharedValue, withTiming } from '../animation'
import { GestureDetector } from '../gesture'
import { Portal } from '../portal'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type {
  ImagePreviewCloseReason,
  ImagePreviewImage,
  ImagePreviewProps,
  ImagePreviewRect,
  ImagePreviewRef,
} from './interface'
import { ImagePreviewItem } from './image-preview-item'
import { ImagePreviewTransition } from './image-preview-transition'
import { getImagePreviewStyles } from './style'
import { getImagePreviewToken } from './token'
import type { NormalizedImage } from './utils'
import {
  getCachedImageDimensions,
  getContainSize,
  interpolateClamped,
  isValidRect,
  normalizeImageSource,
  normalizeStartPosition,
} from './utils'
import { useImagePreviewGesture } from './use-image-preview-gesture'
import { useImagePreviewLoader } from './use-image-preview-loader'
import { useImagePreviewPaging } from './use-image-preview-paging'

const initialWindow = Dimensions.get('window')

interface TransitionState {
  from: ImagePreviewRect
  to: ImagePreviewRect
  kind: 'opening' | 'closing'
}

interface ImagePreviewContentProps extends ImagePreviewProps {
  internal?: boolean
}

function getImageDimensions(image: NormalizedImage, width: number, height: number) {
  const cached = getCachedImageDimensions(image)
  return getContainSize(
    image.width ?? cached?.width ?? width,
    image.height ?? cached?.height ?? height,
    width,
    height,
  )
}

function renderSlot(value: React.ReactNode, style?: object) {
  return typeof value === 'string' || typeof value === 'number' ? (
    <Text style={style}>{value}</Text>
  ) : (
    value
  )
}

export const ImagePreviewContent = forwardRef<ImagePreviewRef, ImagePreviewContentProps>(
  function ImagePreviewContent(
    {
      visible = false,
      images,
      startPosition = 0,
      loop = true,
      showIndex = true,
      showIndicators = false,
      minZoom = 0.5,
      maxZoom = 3,
      doubleTapZoom = 2,
      closeable = false,
      closeOnPressImage = true,
      closeOnPressOverlay = true,
      closeOnGesture = true,
      sourceRect = null,
      getSourceRect,
      swipeDuration,
      transitionDuration,
      renderImage,
      renderIndex,
      renderToolbar,
      onChange,
      onScale,
      onRequestClose,
      onOpen,
      onOpened,
      onClose,
      onClosed,
      onLayout: userOnLayout,
      style,
      styles,
      internal,
      ...viewProps
    },
    ref,
  ) {
    void internal
    // Native paging owns its own timing; keep the prop for source compatibility.
    void swipeDuration

    const { token: themeToken } = useToken()
    const token = useComponentToken('ImagePreview', getImagePreviewToken)
    const resolved = getImagePreviewStyles(token)
    const count = images.length
    const normalizedImages = useMemo(() => Array.from(images, normalizeImageSource), [images])
    const safeMinZoom = Number.isFinite(minZoom) && minZoom > 0 ? minZoom : 0.5
    const safeMaxZoom = Number.isFinite(maxZoom) ? Math.max(safeMinZoom, maxZoom) : 3
    const safeDoubleTapZoom = Number.isFinite(doubleTapZoom)
      ? Math.min(safeMaxZoom, Math.max(1, doubleTapZoom))
      : 2
    const normalizedStart = normalizeStartPosition(startPosition, count, loop)
    const [rendered, setRendered] = useState(visible)
    const [activeIndex, setActiveIndex] = useState(normalizedStart)
    const [transition, setTransition] = useState<TransitionState | null>(null)
    const [opening, setOpening] = useState(visible)
    const [closing, setClosing] = useState(false)
    const [viewport, setViewport] = useState({
      width: Math.max(1, initialWindow.width),
      height: Math.max(1, initialWindow.height),
    })
    const activeIndexRef = useRef(normalizedStart)
    const visibleRef = useRef(visible)
    const wasVisibleRef = useRef(visible)
    const startedRef = useRef(false)
    const closeFromRectRef = useRef<ImagePreviewRect | null>(null)
    const closeCompletedRef = useRef(false)
    const lifecycleRef = useRef(0)
    const onScaleRef = useRef(onScale)
    const renderImageRef = useRef(renderImage)
    const openProgressSV = useSharedValue(visible ? 1 : 0)
    const closeProgressSV = useSharedValue(0)

    visibleRef.current = visible
    onScaleRef.current = onScale
    renderImageRef.current = renderImage

    const { markImageReady } = useImagePreviewLoader(
      normalizedImages,
      activeIndex,
      visible,
      loop,
      Boolean(renderImage),
    )

    const semantic = resolveStyles(styles, {
      props: { ...viewProps, visible, images },
      state: { visible, activeIndex, total: count, opening, closing },
    })

    const fullscreenRect = useCallback(
      (index: number): ImagePreviewRect => {
        const size = getImageDimensions(
          normalizedImages[index] ?? normalizeImageSource(''),
          viewport.width,
          viewport.height,
        )
        return {
          x: (viewport.width - size.width) / 2,
          y: (viewport.height - size.height) / 2,
          width: size.width,
          height: size.height,
        }
      },
      [normalizedImages, viewport.height, viewport.width],
    )

    const readSourceRect = useCallback(
      async (index: number, openingTransition: boolean) => {
        if (openingTransition && isValidRect(sourceRect)) return sourceRect
        if (getSourceRect) {
          try {
            const value = await getSourceRect(index)
            return isValidRect(value) ? value : null
          } catch {
            return null
          }
        }
        return isValidRect(sourceRect) ? sourceRect : null
      },
      [getSourceRect, sourceRect],
    )

    const requestClose = useCallback(
      (reason: ImagePreviewCloseReason, fromRect?: ImagePreviewRect) => {
        if (!visibleRef.current || closing) return
        closeFromRectRef.current = fromRect ?? null
        onClose?.(reason)
        onRequestClose?.(reason)
      },
      [closing, onClose, onRequestClose],
    )
    const requestCloseRef = useRef(requestClose)
    requestCloseRef.current = requestClose
    const stableRequestClose = useCallback(
      (reason: ImagePreviewCloseReason, fromRect?: ImagePreviewRect) => {
        requestCloseRef.current(reason, fromRect)
      },
      [],
    )

    const gestureEnabled = rendered && visible && !opening && !closing
    const gesture = useImagePreviewGesture({
      activeIndex,
      closeOnGesture,
      closeOnPressImage,
      closeOnPressOverlay,
      doubleTapZoom: safeDoubleTapZoom,
      enabled: gestureEnabled,
      maxZoom: safeMaxZoom,
      minZoom: safeMinZoom,
      normalized: normalizedImages[activeIndex],
      onRequestClose: stableRequestClose,
      onScale: (params) => onScaleRef.current?.(params),
      viewportHeight: viewport.height,
      viewportWidth: viewport.width,
    })
    const {
      animatedStyle,
      dismissTranslateY,
      isPinching,
      isZoomed,
      nativeScrollGesture,
      reset: resetGesture,
      updateImageDimensions,
    } = gesture

    const handleChange = useCallback(
      (index: number) => {
        const previous = activeIndexRef.current
        activeIndexRef.current = index
        if (previous === index) return
        resetGesture()
        setActiveIndex(index)
        onChange?.(index)
      },
      [onChange, resetGesture],
    )
    const paging = useImagePreviewPaging({
      count,
      initialIndex: normalizedStart,
      loop,
      onIndexChange: handleChange,
      viewportWidth: viewport.width,
    })
    const { getLogicalIndex, reset: resetPaging, scrollToIndex } = paging

    const onItemReady = useCallback(
      (index: number, dimensions?: { width: number; height: number }) => {
        markImageReady(index, dimensions)
        if (index === activeIndexRef.current && dimensions) {
          updateImageDimensions(dimensions.width, dimensions.height)
        }
      },
      [markImageReady, updateImageDimensions],
    )

    const renderImageForItem = useCallback(
      (image: ImagePreviewImage, index: number) => renderImageRef.current?.(image, index),
      [],
    )
    const renderImageForTransition = useCallback(
      (image: ImagePreviewImage) => renderImageRef.current?.(image, activeIndexRef.current),
      [],
    )

    const finishClose = useCallback(() => {
      if (closeCompletedRef.current) return
      closeCompletedRef.current = true
      setRendered(false)
      setOpening(false)
      setClosing(false)
      setTransition(null)
      closeProgressSV.value = 0
      resetGesture()
      onClosed?.()
    }, [closeProgressSV, onClosed, resetGesture])

    const startClose = useCallback(async () => {
      if (!rendered || closing) return
      const lifecycle = ++lifecycleRef.current
      setClosing(true)
      setOpening(false)
      closeCompletedRef.current = false
      closeProgressSV.value = 0
      const index = activeIndexRef.current
      const target = await readSourceRect(index, false)
      if (lifecycle !== lifecycleRef.current) return
      const from = closeFromRectRef.current ?? fullscreenRect(index)
      if (isValidRect(target)) setTransition({ from, to: target, kind: 'closing' })
      const duration =
        themeToken.motion === false ? 0 : Math.max(0, transitionDuration ?? token.animationDuration)
      closeProgressSV.value = withTiming(1, { duration }, (finished) => {
        'worklet'
        if (finished) scheduleOnRN(finishClose)
      })
      if (duration === 0) finishClose()
    }, [
      closing,
      closeProgressSV,
      finishClose,
      fullscreenRect,
      readSourceRect,
      rendered,
      themeToken.motion,
      token.animationDuration,
      transitionDuration,
    ])

    const startOpen = useCallback(async () => {
      if (count === 0) {
        setRendered(true)
        setOpening(false)
        onOpen?.()
        onOpened?.()
        return
      }
      const lifecycle = ++lifecycleRef.current
      closeFromRectRef.current = null
      activeIndexRef.current = normalizedStart
      setActiveIndex(normalizedStart)
      resetGesture()
      resetPaging(normalizedStart)
      setRendered(true)
      setClosing(false)
      setOpening(true)
      setTransition(null)
      closeProgressSV.value = 0
      openProgressSV.value = 0
      onOpen?.()
      const source = await readSourceRect(normalizedStart, true)
      if (lifecycle !== lifecycleRef.current || !visibleRef.current) return
      const duration =
        themeToken.motion === false ? 0 : Math.max(0, transitionDuration ?? token.animationDuration)
      if (isValidRect(source)) {
        setTransition({ from: source, to: fullscreenRect(normalizedStart), kind: 'opening' })
        openProgressSV.value = withTiming(1, { duration })
        if (duration === 0) {
          setOpening(false)
          setTransition(null)
          onOpened?.()
        }
      } else {
        openProgressSV.value = withTiming(1, { duration })
        setOpening(false)
        onOpened?.()
      }
    }, [
      closeProgressSV,
      count,
      fullscreenRect,
      normalizedStart,
      onOpen,
      onOpened,
      openProgressSV,
      resetGesture,
      resetPaging,
      readSourceRect,
      themeToken.motion,
      token.animationDuration,
      transitionDuration,
    ])

    const finishOpenTransition = useCallback(() => {
      if (!opening) return
      setOpening(false)
      setTransition(null)
      openProgressSV.value = 1
      onOpened?.()
    }, [onOpened, openProgressSV, opening])

    useImperativeHandle(
      ref,
      () => ({
        resetScale: resetGesture,
        swipeTo: (index, options) => scrollToIndex(index, options?.immediate),
      }),
      [resetGesture, scrollToIndex],
    )

    useEffect(() => {
      if (visible && (!wasVisibleRef.current || !startedRef.current)) {
        startedRef.current = true
        void startOpen()
      }
      if (!visible && wasVisibleRef.current) void startClose()
      wasVisibleRef.current = visible
    }, [startClose, startOpen, visible])

    useEffect(() => {
      if (!visible && !rendered) startedRef.current = false
    }, [rendered, visible])

    useEffect(() => {
      if (!rendered || !visible || Platform.OS !== 'android') return undefined
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        requestClose('back')
        return true
      })
      return () => subscription.remove()
    }, [rendered, requestClose, visible])

    const transitionOpacityStyle = useAnimatedStyle(
      () => ({
        opacity: opening ? openProgressSV.value : closing ? 1 - closeProgressSV.value : 1,
      }),
      [closing, closeProgressSV, opening, openProgressSV],
    )
    const controlsOpacityStyle = useAnimatedStyle(
      () => ({
        opacity:
          (opening ? openProgressSV.value : closing ? 1 - closeProgressSV.value : 1) *
          Math.max(0, 1 - Math.max(0, dismissTranslateY.value) / 50),
      }),
      [closing, closeProgressSV, dismissTranslateY, opening, openProgressSV],
    )
    const overlayTransitionStyle = useAnimatedStyle(
      () => ({
        opacity:
          (opening ? openProgressSV.value : closing ? 1 - closeProgressSV.value : 1) *
          interpolateClamped(Math.max(0, dismissTranslateY.value), 0, 200, 1, 0),
      }),
      [closing, closeProgressSV, dismissTranslateY, opening, openProgressSV],
    )

    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout
        if (width > 0 && height > 0) {
          setViewport((current) =>
            current.width === width && current.height === height ? current : { width, height },
          )
        }
        userOnLayout?.(event)
      },
      [userOnLayout],
    )

    const renderPage = useCallback(
      ({ item: physicalIndex }: ListRenderItemInfo<number>) => {
        const index = getLogicalIndex(physicalIndex)
        return (
          <View style={{ height: viewport.height, width: viewport.width }}>
            <ImagePreviewItem
              active={activeIndex === index}
              animatedStyle={activeIndex === index ? animatedStyle : undefined}
              image={images[index]}
              index={index}
              normalized={normalizedImages[index]}
              onImageReady={onItemReady}
              renderImage={renderImage ? renderImageForItem : undefined}
            />
          </View>
        )
      },
      [
        activeIndex,
        animatedStyle,
        images,
        normalizedImages,
        onItemReady,
        getLogicalIndex,
        renderImage,
        renderImageForItem,
        viewport.height,
        viewport.width,
      ],
    )

    if (!rendered) return null

    const renderIndexContent =
      showIndex && count > 0 ? (
        renderIndex ? (
          renderSlot(renderIndex({ index: activeIndex, total: count }), resolved.index)
        ) : (
          <Text style={[resolved.index, semantic?.index]}>{`${activeIndex + 1}/${count}`}</Text>
        )
      ) : null
    const transitionImage = transition ? (
      <ImagePreviewTransition
        duration={
          themeToken.motion === false
            ? 0
            : Math.max(0, transitionDuration ?? token.animationDuration)
        }
        fromRect={transition.from}
        image={images[activeIndex] ?? ''}
        normalized={normalizedImages[activeIndex]}
        onLoad={
          renderImage ? undefined : (event) => onItemReady(activeIndex, event.nativeEvent.source)
        }
        onLoadEnd={renderImage ? undefined : () => onItemReady(activeIndex)}
        onComplete={transition.kind === 'opening' ? finishOpenTransition : finishClose}
        renderImage={renderImage ? renderImageForTransition : undefined}
        toRect={transition.to}
      />
    ) : null

    return (
      <GestureDetector gesture={gesture.gesture}>
        <View
          {...viewProps}
          collapsable={false}
          onLayout={handleLayout}
          style={[resolved.root, semantic?.root, style]}
          testID="image-preview"
        >
          <Animated.View
            pointerEvents={closeOnPressOverlay ? 'auto' : 'none'}
            style={[resolved.overlay, semantic?.overlay, overlayTransitionStyle]}
          >
            {closeOnPressOverlay ? (
              <Pressable
                accessibilityLabel="Close image preview"
                onPress={() => requestClose('overlay')}
                style={{ flex: 1 }}
                testID="image-preview-overlay"
              />
            ) : null}
          </Animated.View>
          <Animated.View style={[resolved.pager, semantic?.pager, transitionOpacityStyle]}>
            <GestureDetector gesture={nativeScrollGesture}>
              <FlatList
                data={paging.data}
                extraData={activeIndex}
                getItemLayout={paging.getItemLayout}
                horizontal
                initialNumToRender={1}
                initialScrollIndex={paging.initialScrollIndex}
                keyExtractor={paging.keyExtractor}
                maxToRenderPerBatch={3}
                onMomentumScrollEnd={paging.onMomentumScrollEnd}
                onScrollToIndexFailed={paging.onScrollToIndexFailed}
                pagingEnabled
                ref={paging.listRef}
                removeClippedSubviews
                renderItem={renderPage}
                scrollEnabled={gestureEnabled && !isZoomed && !isPinching}
                showsHorizontalScrollIndicator={false}
                testID="image-preview-pager"
                windowSize={3}
              />
            </GestureDetector>
          </Animated.View>
          {transitionImage}
          <Animated.View
            pointerEvents="box-none"
            style={[resolved.controls, semantic?.controls, controlsOpacityStyle]}
          >
            {renderIndexContent}
            {renderSlot(renderToolbar?.({ index: activeIndex, total: count }))}
            {closeable ? (
              <Pressable
                accessibilityLabel="Close image preview"
                accessibilityRole="button"
                onPress={() => requestClose('close-icon')}
                style={[resolved.closeButton, semantic?.closeButton]}
                testID="image-preview-close"
              >
                <Text style={[resolved.closeLabel, semantic?.closeLabel]}>×</Text>
              </Pressable>
            ) : null}
            {showIndicators && count > 1 ? (
              <View pointerEvents="none" style={resolved.indicators}>
                {Array.from({ length: count }, (_, index) => (
                  <View
                    key={index}
                    style={[resolved.indicator, index === activeIndex && resolved.activeIndicator]}
                  />
                ))}
              </View>
            ) : null}
          </Animated.View>
        </View>
      </GestureDetector>
    )
  },
)

ImagePreviewContent.displayName = 'ImagePreview.Content'

export const ImagePreview = forwardRef<ImagePreviewRef, ImagePreviewProps>(
  function ImagePreview(props, ref) {
    return (
      <Portal>
        <ImagePreviewContent {...props} ref={ref} />
      </Portal>
    )
  },
)

ImagePreview.displayName = 'ImagePreview'
