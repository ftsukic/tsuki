import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { BackHandler, Dimensions, FlatList, Platform, Pressable, View } from 'react-native'
import type { LayoutChangeEvent, ListRenderItemInfo } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'
import { Animated, useAnimatedStyle, useSharedValue, withTiming } from '../animation'
import { GestureDetector } from '../gesture'
import { Portal } from '../portal'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import type {
  ImagePreviewCloseReason,
  ImagePreviewProps,
  ImagePreviewRect,
  ImagePreviewRef,
} from './types'
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
  imageIndex: number
}

type ImagePreviewPhase = 'closed' | 'opening' | 'open' | 'closing'

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
      safeAreaInsetTop = true,
      safeAreaInsetBottom = true,
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
    const safeAreaInsets = useContext(SafeAreaInsetsContext)
    const topInset = safeAreaInsetTop ? Math.max(0, safeAreaInsets?.top ?? 0) : 0
    const bottomInset = safeAreaInsetBottom ? Math.max(0, safeAreaInsets?.bottom ?? 0) : 0
    const count = images.length
    const normalizedImages = useMemo(() => Array.from(images, normalizeImageSource), [images])
    const safeMinZoom = Number.isFinite(minZoom) && minZoom > 0 ? minZoom : 0.5
    const safeMaxZoom = Number.isFinite(maxZoom) ? Math.max(safeMinZoom, maxZoom) : 3
    const safeDoubleTapZoom = Number.isFinite(doubleTapZoom)
      ? Math.min(safeMaxZoom, Math.max(1, doubleTapZoom))
      : 2
    const normalizedStart = normalizeStartPosition(startPosition, count, loop)
    const [activeIndex, setActiveIndex] = useState(normalizedStart)
    const [transition, setTransition] = useState<TransitionState | null>(null)
    const [phase, setPhase] = useState<ImagePreviewPhase>(visible ? 'opening' : 'closed')
    const [viewport, setViewport] = useState({
      width: Math.max(1, initialWindow.width),
      height: Math.max(1, initialWindow.height),
    })
    const phaseRef = useRef<ImagePreviewPhase>(phase)
    const activeIndexRef = useRef(normalizedStart)
    const visibleRef = useRef(visible)
    const wasVisibleRef = useRef(visible)
    const startedRef = useRef(false)
    const openingIndexRef = useRef(normalizedStart)
    const closeFromRectRef = useRef<ImagePreviewRect | null>(null)
    const closeCompletedRef = useRef(false)
    const lifecycleRef = useRef(0)
    const onScaleRef = useRef(onScale)
    const transitionProgressSV = useSharedValue(0)

    visibleRef.current = visible
    phaseRef.current = phase
    onScaleRef.current = onScale

    const { isImageReady, loadedIndices, markImageReady } = useImagePreviewLoader(
      normalizedImages,
      activeIndex,
      visible,
      loop,
      !renderImage,
    )
    const opening = phase === 'opening'
    const closing = phase === 'closing'
    const rendered = phase !== 'closed'

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
        if (openingTransition) {
          if (isValidRect(sourceRect)) return sourceRect
          if (!getSourceRect) return null
        } else {
          if (getSourceRect) {
            try {
              const value = await getSourceRect(index)
              return isValidRect(value) ? value : null
            } catch {
              return null
            }
          }
          return index === openingIndexRef.current && isValidRect(sourceRect) ? sourceRect : null
        }

        try {
          const value = await getSourceRect(index)
          return isValidRect(value) ? value : null
        } catch {
          return null
        }
      },
      [getSourceRect, sourceRect],
    )

    const requestClose = useCallback(
      (reason: ImagePreviewCloseReason, fromRect?: ImagePreviewRect) => {
        if (!visibleRef.current || closing) return
        closeFromRectRef.current = fromRect ?? null
        onRequestClose?.(reason)
      },
      [closing, onRequestClose],
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

    const runTransition = useCallback(
      (duration: number, onComplete: () => void) => {
        transitionProgressSV.value = withTiming(1, { duration }, (finished) => {
          'worklet'
          if (finished) scheduleOnRN(onComplete)
        })
        if (duration === 0) onComplete()
      },
      [transitionProgressSV],
    )

    const finishOpenTransition = useCallback(() => {
      if (phaseRef.current !== 'opening') return
      phaseRef.current = 'open'
      setPhase('open')
      setTransition(null)
      transitionProgressSV.value = 1
      onOpened?.()
    }, [onOpened, transitionProgressSV])

    const finishClose = useCallback(() => {
      if (phaseRef.current !== 'closing' || closeCompletedRef.current) return
      closeCompletedRef.current = true
      phaseRef.current = 'closed'
      setPhase('closed')
      setTransition(null)
      closeFromRectRef.current = null
      transitionProgressSV.value = 0
      resetGesture()
      onClosed?.()
    }, [onClosed, resetGesture, transitionProgressSV])

    const startClose = useCallback(async () => {
      if (!rendered || closing) return
      const lifecycle = ++lifecycleRef.current
      closeCompletedRef.current = false
      phaseRef.current = 'closing'
      setPhase('closing')
      setTransition(null)
      transitionProgressSV.value = 0
      const index = activeIndexRef.current
      const target = await readSourceRect(index, false)
      if (lifecycle !== lifecycleRef.current) return
      const from = isValidRect(closeFromRectRef.current)
        ? closeFromRectRef.current
        : fullscreenRect(index)
      if (isValidRect(target)) {
        setTransition({ from, to: target, kind: 'closing', imageIndex: index })
      }
      const duration =
        themeToken.motion === false ? 0 : Math.max(0, transitionDuration ?? token.animationDuration)
      runTransition(duration, finishClose)
    }, [
      closing,
      finishClose,
      fullscreenRect,
      readSourceRect,
      rendered,
      runTransition,
      themeToken.motion,
      token.animationDuration,
      transitionDuration,
      transitionProgressSV,
    ])

    const startOpen = useCallback(async () => {
      if (count === 0) {
        phaseRef.current = 'open'
        setPhase('open')
        onOpen?.()
        onOpened?.()
        return
      }
      const lifecycle = ++lifecycleRef.current
      closeFromRectRef.current = null
      openingIndexRef.current = normalizedStart
      activeIndexRef.current = normalizedStart
      setActiveIndex(normalizedStart)
      resetGesture()
      resetPaging(normalizedStart)
      closeCompletedRef.current = false
      phaseRef.current = 'opening'
      setPhase('opening')
      setTransition(null)
      transitionProgressSV.value = 0
      onOpen?.()
      const source = await readSourceRect(normalizedStart, true)
      if (lifecycle !== lifecycleRef.current || !visibleRef.current) return
      const duration =
        themeToken.motion === false ? 0 : Math.max(0, transitionDuration ?? token.animationDuration)
      if (isValidRect(source)) {
        setTransition({
          from: source,
          to: fullscreenRect(normalizedStart),
          kind: 'opening',
          imageIndex: normalizedStart,
        })
      }
      runTransition(duration, finishOpenTransition)
    }, [
      count,
      finishOpenTransition,
      fullscreenRect,
      normalizedStart,
      onOpen,
      onOpened,
      readSourceRect,
      resetGesture,
      resetPaging,
      runTransition,
      themeToken.motion,
      token.animationDuration,
      transitionDuration,
      transitionProgressSV,
    ])

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
      if (!visible && wasVisibleRef.current) {
        onClose?.()
        void startClose()
      }
      wasVisibleRef.current = visible
    }, [onClose, startClose, startOpen, visible])

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

    const pagerOpacityStyle = useAnimatedStyle(
      () => ({
        opacity:
          phase === 'opening'
            ? transition
              ? 0
              : 1
            : phase === 'closing'
              ? transition
                ? 0
                : 1 - transitionProgressSV.value
              : 1,
      }),
      [phase, transition, transitionProgressSV],
    )
    const controlsOpacityStyle = useAnimatedStyle(
      () => ({
        opacity:
          (phase === 'opening'
            ? transitionProgressSV.value
            : phase === 'closing'
              ? 1 - transitionProgressSV.value
              : 1) * Math.max(0, 1 - Math.max(0, dismissTranslateY.value) / 50),
      }),
      [dismissTranslateY, phase, transitionProgressSV],
    )
    const overlayTransitionStyle = useAnimatedStyle(
      () => ({
        opacity:
          (phase === 'opening'
            ? transitionProgressSV.value
            : phase === 'closing'
              ? 1 - transitionProgressSV.value
              : 1) * interpolateClamped(Math.max(0, dismissTranslateY.value), 0, 200, 1, 0),
      }),
      [dismissTranslateY, phase, transitionProgressSV],
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
              initiallyReady={isImageReady(index)}
              normalized={normalizedImages[index]}
              onImageReady={onItemReady}
              ready={isImageReady(index)}
              renderImage={renderImage}
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
        isImageReady,
        renderImage,
        viewport.height,
        viewport.width,
      ],
    )

    if (!rendered) return null

    const indexPositionStyle = {
      top: topInset + token.indexTop,
    }
    const indexStyle = [resolved.index, indexPositionStyle, semantic?.index]
    const customIndex =
      showIndex && count > 0 ? renderIndex?.({ index: activeIndex, total: count }) : null
    const renderIndexContent =
      showIndex && count > 0 ? (
        renderIndex ? (
          customIndex == null ? null : typeof customIndex === 'string' ||
            typeof customIndex === 'number' ? (
            renderSlot(customIndex, indexStyle)
          ) : (
            <View
              pointerEvents="box-none"
              style={[
                {
                  position: 'absolute',
                  width: '100%',
                },
                indexPositionStyle,
                semantic?.index,
              ]}
            >
              {customIndex}
            </View>
          )
        ) : (
          <Text style={indexStyle}>{`${activeIndex + 1}/${count}`}</Text>
        )
      ) : null
    const transitionIndex = transition?.imageIndex ?? activeIndex
    const transitionImage = transition ? (
      <ImagePreviewTransition
        fromRect={transition.from}
        image={images[transitionIndex] ?? ''}
        index={transitionIndex}
        normalized={normalizedImages[transitionIndex]}
        onImageReady={onItemReady}
        progress={transitionProgressSV}
        renderImage={renderImage}
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
          <Animated.View style={[resolved.pager, semantic?.pager, pagerOpacityStyle]}>
            <GestureDetector gesture={nativeScrollGesture}>
              <FlatList
                data={paging.data}
                extraData={[activeIndex, loadedIndices]}
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
                removeClippedSubviews={false}
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
            {closeable ? (
              <Pressable
                accessibilityLabel="Close image preview"
                accessibilityRole="button"
                onPress={() => requestClose('close-icon')}
                style={[
                  resolved.closeButton,
                  {
                    top: topInset + Math.max(0, token.closeIconTop - 8),
                  },
                  semantic?.closeButton,
                ]}
                testID="image-preview-close"
              >
                <Text style={[resolved.closeLabel, semantic?.closeLabel]}>×</Text>
              </Pressable>
            ) : null}
            <View
              pointerEvents="box-none"
              style={[
                resolved.bottomControls,
                {
                  paddingBottom: bottomInset,
                },
                semantic?.bottomControls,
              ]}
              testID="image-preview-bottom-controls"
            >
              {showIndicators && count > 1 ? (
                <View
                  pointerEvents="none"
                  style={[resolved.indicators, semantic?.indicators]}
                  testID="image-preview-indicators"
                >
                  {Array.from({ length: count }, (_, index) => (
                    <View
                      key={index}
                      style={[
                        resolved.indicator,
                        semantic?.indicator,
                        index === activeIndex && [
                          resolved.activeIndicator,
                          semantic?.activeIndicator,
                        ],
                      ]}
                    />
                  ))}
                </View>
              ) : null}
              {renderToolbar ? (
                <View style={[resolved.toolbar, semantic?.toolbar]} testID="image-preview-toolbar">
                  {renderSlot(renderToolbar({ index: activeIndex, total: count }))}
                </View>
              ) : null}
            </View>
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
