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
import type { ReactNode } from 'react'
import { BackHandler, Dimensions, Platform, View } from 'react-native'
import type { FlatList, LayoutChangeEvent, ListRenderItemInfo } from 'react-native'
import Animated, {
  runOnUI,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated'
import { SafeAreaInsetsContext, initialWindowMetrics } from 'react-native-safe-area-context'
import { GestureDetector } from '../gesture'
import { Pressable } from '../pressable'
import { Text } from '../text'
import { resolveStyles } from '../style'
import { useToken, useComponentToken } from '../theme'
import { getImagePreviewStyles } from './style'
import { getImagePreviewToken } from './token'
import { containRect } from './geometry'
import { ImagePreviewPage } from './image-preview-page'
import { useImagePreviewInteraction } from './useImagePreviewInteraction'
import type { ImagePreviewInteractionState } from './useImagePreviewInteraction'
import { useImagePreviewSession } from './useImagePreviewSession'
import { useImagePreviewLoader } from './useImagePreviewLoader'
import type {
  ImagePreviewProps,
  ImagePreviewRef,
  ImagePreviewImage,
  ImagePreviewCloseReason,
  ImagePreviewLoadState,
} from './types'
const windowSize = Dimensions.get('window')
function slot(node: ReactNode) {
  return typeof node === 'string' || typeof node === 'number' ? <Text>{node}</Text> : node
}
export const ImagePreviewContent = forwardRef<ImagePreviewRef, ImagePreviewProps>(
  function ImagePreviewContent(props, ref) {
    const {
      visible = false,
      items,
      activeId,
      closeable = true,
      closeOnGesture = true,
      showIndex = false,
      interactionDisabled = false,
      transitionDuration,
      getSourceRect,
      imageAdapter,
      renderMedia,
      renderIndex,
      renderToolbar,
      renderOverlay,
      onChange,
      onLongPress,
      onRequestClose,
      onOpen,
      onOpened,
      onClose,
      onClosed,
      onLayout,
      style,
      styles,
      ...viewProps
    } = props
    const { token: themeToken } = useToken()
    const token = useComponentToken('ImagePreview', getImagePreviewToken)
    const resolved = getImagePreviewStyles(token)
    const safeArea = useContext(SafeAreaInsetsContext) ?? initialWindowMetrics?.insets
    const topInset = Math.max(0, safeArea?.top ?? 0),
      bottomInset = Math.max(0, safeArea?.bottom ?? 0)
    const [selectedId, setSelectedId] = useState(activeId ?? items[0]?.id)
    const [viewport, setViewport] = useState({
      x: 0,
      y: 0,
      width: Math.max(1, windowSize.width),
      height: Math.max(1, windowSize.height),
    })
    const [layoutReady, setLayoutReady] = useState(false)
    const [interactionState, setInteractionState] = useState<ImagePreviewInteractionState>('idle')
    const [originals, setOriginals] = useState<
      Record<string, { attempt: number; status: ImagePreviewLoadState }>
    >({})
    const [displayed, setDisplayed] = useState<Record<string, boolean>>({})
    const galleryRef = useRef(items)
    if (!selectedId || items.some((entry) => entry.id === selectedId)) galleryRef.current = items
    const gallery = galleryRef.current
    const activeIndex = Math.max(
      0,
      gallery.findIndex((entry) => entry.id === selectedId),
    )
    const item = gallery[activeIndex],
      count = gallery.length
    const ids = useMemo(() => gallery.map((entry) => entry.id), [gallery])
    const images = useMemo(
      () => gallery.map((entry) => containRect(entry, viewport.width, viewport.height)),
      [gallery, viewport.width, viewport.height],
    )
    const pageWidth = viewport.width + themeToken.paddingSM
    const pager = useAnimatedRef<FlatList<ImagePreviewImage>>()
    const root = useRef<View>(null)
    const enabled = visible && !interactionDisabled
    const callbacks = useRef({ onChange, onLongPress, onRequestClose })
    callbacks.current = { onChange, onLongPress, onRequestClose }
    const select = useCallback((id: string) => {
      const index = galleryRef.current.findIndex((entry) => entry.id === id),
        entry = galleryRef.current[index]
      if (!entry) return
      setSelectedId(id)
      callbacks.current.onChange?.({ id, item: entry, index, count: galleryRef.current.length })
    }, [])
    const requestRef = useRef<(reason: ImagePreviewCloseReason) => void>(() => {})
    const close = useCallback((reason: 'image' | 'gesture') => requestRef.current(reason), [])
    const longPress = useCallback(() => {
      const current = interactionRef.current
      const id = current?.selected.value
      const index = galleryRef.current.findIndex((entry) => entry.id === id),
        entry = galleryRef.current[index]
      if (entry)
        callbacks.current.onLongPress?.({
          id: entry.id,
          item: entry,
          index,
          count: galleryRef.current.length,
        })
    }, [])
    const interaction = useImagePreviewInteraction({
      enabled,
      ids,
      images,
      activeId: selectedId,
      viewport,
      pageWidth,
      closeOnGesture,
      onSelect: select,
      onClose: close,
      onLongPress: longPress,
      onStateChange: setInteractionState,
    })
    const interactionRef = useRef(interaction)
    interactionRef.current = interaction
    const onBegin = useCallback(
      (reopening: boolean) => {
        galleryRef.current = items
        setSelectedId((current) =>
          items.some((entry) => entry.id === (activeId ?? current))
            ? (activeId ?? current)
            : items[0]?.id,
        )
        if (!reopening) {
          setOriginals({})
          setDisplayed({})
          setLayoutReady(false)
        }
      },
      [items, activeId],
    )
    const session = useImagePreviewSession({
      props: { ...props, getSourceRect, onOpen, onOpened, onClose, onClosed },
      id: selectedId,
      viewport,
      layoutReady,
      displayReady: Boolean(displayed[selectedId ?? '']),
      duration: transitionDuration ?? token.animationDuration,
      pageWidth,
      interaction,
      onBegin,
    })
    const phase = session.phase
    const requestClose = useCallback(
      (reason: ImagePreviewCloseReason) => {
        if (
          !visible ||
          phase === 'closing' ||
          (interactionDisabled && reason !== 'removed' && reason !== 'imperative')
        )
          return
        callbacks.current.onRequestClose?.(reason)
        requestAnimationFrame(() => {
          if (interactionRef.current && visibleRef.current)
            runOnUI(interactionRef.current.restore)()
        })
      },
      [visible, phase, interactionDisabled],
    )
    const visibleRef = useRef(visible)
    visibleRef.current = visible
    requestRef.current = requestClose
    const previousProp = useRef(activeId)
    useEffect(() => {
      if (previousProp.current === activeId) return
      previousProp.current = activeId
      if (activeId && items.some((entry) => entry.id === activeId)) setSelectedId(activeId)
    }, [activeId, items])
    useEffect(() => {
      if (visible && selectedId && !items.some((entry) => entry.id === selectedId))
        requestClose('removed')
    }, [items, visible, selectedId, requestClose])
    useEffect(() => {
      if (!enabled || Platform.OS !== 'android') return
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        requestClose('back')
        return true
      })
      return () => subscription.remove()
    }, [enabled, requestClose])
    useImagePreviewLoader(gallery, activeIndex, visible, imageAdapter)
    const { position, dragY, state: gestureState } = interaction
    const { mask, paging, progress, presentation } = session
    useAnimatedReaction(
      () => position.value,
      (offset) => {
        scrollTo(pager, offset, 0, false)
      },
      [pager, position],
    )
    useEffect(() => {
      if (!layoutReady) return
      pager.current?.scrollToOffset({ offset: position.value, animated: false })
    }, [layoutReady, pageWidth, pager, position])
    useImperativeHandle(
      ref,
      () => ({
        resetScale: () => runOnUI(interaction.reset)(),
        swipeTo: (id, options) => {
          if (!enabled) return
          const index = ids.indexOf(id)
          if (index >= 0) runOnUI(interaction.settlePage)(index, options?.immediate ?? false)
        },
      }),
      [interaction, enabled, ids],
    )
    const maskStyle = useAnimatedStyle(() => ({ opacity: mask.value }), [mask])
    const pagerStyle = useAnimatedStyle(
      () => ({ opacity: presentation.value * (paging.value ? progress.value : 1) }),
      [paging, progress, presentation],
    )
    const controlsStyle = useAnimatedStyle(() => {
      const distance = Math.abs(position.value - Math.round(position.value / pageWidth) * pageWidth)
      return {
        opacity:
          phase === 'closed' ||
          phase === 'closing' ||
          presentation.value === 0 ||
          !layoutReady ||
          dragY.value > 0
            ? 0
            : Math.max(0, 1 - distance / (viewport.width / 4)),
      }
    }, [phase, layoutReady, position, dragY, pageWidth, viewport.width, presentation])
    const hidePeers = useDerivedValue(
      () => (phase === 'closing' && !paging.value) || gestureState.value === 'dismiss',
      [phase, gestureState, paging],
    )
    const originalState = useCallback(
      (id: string, status: ImagePreviewLoadState) =>
        setOriginals((current) =>
          !current[id] || current[id].status === status
            ? current
            : { ...current, [id]: { ...current[id], status } },
        ),
      [],
    )
    const displayState = useCallback((id: string, status: ImagePreviewLoadState) => {
      if (status === 'loaded' || status === 'error')
        setDisplayed((current) => (current[id] ? current : { ...current, [id]: true }))
    }, [])
    const renderPage = useCallback(
      ({ item: page, index }: ListRenderItemInfo<ImagePreviewImage>) => (
        <ImagePreviewPage
          item={page}
          width={viewport.width}
          height={viewport.height}
          pageWidth={index === count - 1 ? viewport.width : pageWidth}
          selected={interaction.selected}
          rect={session.rect}
          clip={session.clip}
          opacity={session.opacity}
          hidden={hidePeers}
          imageAdapter={imageAdapter}
          renderMedia={renderMedia}
          active={page.id === selectedId}
          playing={page.id === selectedId && phase === 'open' && enabled}
          originalRequested={Boolean(originals[page.id])}
          originalAttempt={originals[page.id]?.attempt ?? 0}
          onOriginalStateChange={originalState}
          onDisplayStateChange={displayState}
        />
      ),
      [
        viewport.width,
        viewport.height,
        pageWidth,
        count,
        interaction.selected,
        session.rect,
        session.clip,
        session.opacity,
        hidePeers,
        imageAdapter,
        renderMedia,
        selectedId,
        phase,
        enabled,
        originals,
        originalState,
        displayState,
      ],
    )
    const semantic =
      resolveStyles(styles, {
        props,
        state: {
          visible,
          activeIndex,
          total: count,
          opening: phase === 'opening',
          closing: phase === 'closing',
        },
      }) ?? {}
    const handleLayout = (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout
      if (width > 0 && height > 0) {
        setViewport((current) => ({ ...current, width, height }))
        // Source conversion only starts after the host's window origin has been measured.
        let complete = false
        const finish = (x = 0, y = 0) => {
          if (complete) return
          complete = true
          clearTimeout(timer)
          setViewport({ x, y, width, height })
          setLayoutReady(true)
        }
        const timer = setTimeout(() => finish(), 160)
        root.current?.measureInWindow((x, y) => finish(x, y))
      }
      onLayout?.(event)
    }
    if (phase === 'closed') return null
    const params = item ? { id: item.id, item, index: activeIndex, count } : null
    return (
      <>
        <View
          {...viewProps}
          ref={root}
          testID={viewProps.testID ?? 'image-preview'}
          onLayout={handleLayout}
          style={[resolved.root, style, semantic.root]}
          pointerEvents={interactionDisabled ? 'none' : 'auto'}
          onStartShouldSetResponder={
            phase === 'closing' ? () => true : viewProps.onStartShouldSetResponder
          }
          onAccessibilityEscape={() => {
            viewProps.onAccessibilityEscape?.()
            requestClose('back')
          }}
          accessibilityViewIsModal={!interactionDisabled}
          accessibilityElementsHidden={phase === 'closing' || interactionDisabled}
          importantForAccessibility={
            phase === 'closing' || interactionDisabled ? 'no-hide-descendants' : 'yes'
          }
        >
          <Animated.View
            testID="image-preview-mask"
            pointerEvents="none"
            style={[resolved.overlay, semantic.mask, maskStyle]}
          />
          <GestureDetector gesture={interaction.gesture}>
            <Animated.View
              style={[resolved.pager, semantic.pager, pagerStyle]}
              testID="image-preview-pager-layer"
            >
              <Animated.FlatList
                key={session.session}
                ref={pager}
                testID="image-preview-pager"
                data={gallery}
                renderItem={renderPage}
                keyExtractor={(entry) => entry.id}
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={activeIndex}
                getItemLayout={(_data, index) => ({
                  length: index === count - 1 ? viewport.width : pageWidth,
                  offset: pageWidth * index,
                  index,
                })}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={5}
                removeClippedSubviews={false}
                extraData={{ selectedId, originals }}
              />
            </Animated.View>
          </GestureDetector>
          <Animated.View
            pointerEvents={enabled && interactionState === 'idle' ? 'box-none' : 'none'}
            testID="image-preview-controls"
            style={[resolved.controls, semantic.controls, controlsStyle]}
          >
            {params && (showIndex || renderIndex) ? (
              <View
                testID="image-preview-index"
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: topInset + token.indexTop,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}
              >
                {renderIndex ? (
                  slot(renderIndex(params))
                ) : (
                  <Text
                    style={[
                      { color: token.indexColor, fontSize: token.indexFontSize },
                      semantic.index,
                    ]}
                  >
                    {activeIndex + 1}/{count}
                  </Text>
                )}
              </View>
            ) : null}
            {closeable ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="关闭图片预览"
                testID="image-preview-close"
                onPress={() => requestClose('close-icon')}
                style={[
                  resolved.closeButton,
                  {
                    top: topInset + token.closeIconTop - 8,
                    right:
                      Math.max(0, token.closeIconRight - 8) + Math.max(0, safeArea?.right ?? 0),
                  },
                  semantic.close,
                ]}
              >
                <Text style={[resolved.closeLabel, semantic.closeContent]}>×</Text>
              </Pressable>
            ) : null}
            {params && renderToolbar ? (
              <View
                testID="image-preview-bottom-controls"
                pointerEvents="box-none"
                style={[
                  resolved.bottomControls,
                  {
                    paddingLeft: themeToken.padding + Math.max(0, safeArea?.left ?? 0),
                    paddingRight: themeToken.padding + Math.max(0, safeArea?.right ?? 0),
                    paddingBottom: bottomInset + themeToken.paddingSM,
                  },
                ]}
              >
                <View
                  testID="image-preview-toolbar"
                  pointerEvents="auto"
                  style={[resolved.toolbar, semantic.toolbar]}
                >
                  {slot(
                    renderToolbar({
                      ...params,
                      close: () => requestClose('imperative'),
                      original: {
                        available: Boolean(item?.original),
                        status: originals[params.id]?.status ?? 'idle',
                        load: () => {
                          if (!item?.original || !enabled) return
                          setOriginals((current) => ({
                            ...current,
                            [params.id]: {
                              attempt: (current[params.id]?.attempt ?? 0) + 1,
                              status: 'loading',
                            },
                          }))
                        },
                      },
                    }),
                  )}
                </View>
              </View>
            ) : null}
          </Animated.View>
        </View>
        {params ? renderOverlay?.(params) : null}
      </>
    )
  },
)
ImagePreviewContent.displayName = 'ImagePreview.Content'
