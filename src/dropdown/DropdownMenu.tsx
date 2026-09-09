import {
  Children,
  forwardRef,
  useContext,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { ScrollView, View, useWindowDimensions } from 'react-native'
import type { LayoutChangeEvent, View as ViewComponent } from 'react-native'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { DropdownMenuContext } from './context'
import { DropdownPopup } from './DropdownPopup'
import { getDropdownMenuStyles } from './style'
import { getDropdownToken } from './token'
import type { DropdownItemRegistration, DropdownMenuContextValue } from './context'
import type { DropdownMenuProps, DropdownMenuRef } from './types'

interface MenuLayout {
  x: number
  y: number
  width: number
  height: number
}

export const DropdownMenu = forwardRef<DropdownMenuRef, DropdownMenuProps>(function DropdownMenu(
  {
    children,
    activeColor,
    overlay = true,
    closeOnPressOverlay = true,
    duration,
    zIndex,
    direction = 'down',
    swipeThreshold = 4,
    style,
    styles,
    onChange,
    onLayout,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('Dropdown', getDropdownToken)
  const { height: windowHeight } = useWindowDimensions()
  const menuRef = useRef<ViewComponent>(null)
  const registrationsRef = useRef<DropdownItemRegistration[]>([])
  const activeIndexRef = useRef<number | null>(null)
  const closingIndexRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)
  const [itemVersion, notifyItemUpdate] = useReducer((value: number) => value + 1, 0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [layout, setLayout] = useState<MenuLayout>({
    height: token.menuHeight,
    width: 0,
    x: 0,
    y: 0,
  })

  onChangeRef.current = onChange
  activeIndexRef.current = activeIndex

  const measureMenu = useCallback(() => {
    const node = menuRef.current
    if (!node || typeof node.measureInWindow !== 'function') return

    node.measureInWindow((x, y, width, measuredHeight) => {
      const nextLayout = {
        height: measuredHeight || token.menuHeight,
        width,
        x,
        y,
      }
      setLayout((current) =>
        current.height === nextLayout.height &&
        current.width === nextLayout.width &&
        current.x === nextLayout.x &&
        current.y === nextLayout.y
          ? current
          : nextLayout,
      )
    })
  }, [token.menuHeight])

  useEffect(() => {
    measureMenu()
  }, [activeIndex, direction, measureMenu, windowHeight])

  const registerItem = useCallback((id: symbol, disabled: boolean) => {
    const existing = registrationsRef.current.find((item) => item.id === id)
    if (existing) {
      existing.disabled = disabled
      return existing.index
    }

    const registration: DropdownItemRegistration = {
      disabled,
      id,
      index: registrationsRef.current.length,
    }
    registrationsRef.current.push(registration)
    return registration.index
  }, [])

  const updateItem = useCallback((id: symbol, item: Partial<DropdownItemRegistration>) => {
    const registration = registrationsRef.current.find((candidate) => candidate.id === id)
    if (registration) Object.assign(registration, item)
  }, [])

  const unregisterItem = useCallback((id: symbol) => {
    const removedIndex = registrationsRef.current.findIndex((item) => item.id === id)
    if (removedIndex < 0) return

    registrationsRef.current.splice(removedIndex, 1)
    registrationsRef.current.forEach((item, index) => {
      item.index = index
    })

    const currentIndex = activeIndexRef.current
    if (currentIndex === removedIndex) {
      activeIndexRef.current = null
      closingIndexRef.current = currentIndex
      setActiveIndex(null)
      onChangeRef.current?.(null)
    } else if (currentIndex !== null && currentIndex > removedIndex) {
      activeIndexRef.current = currentIndex - 1
      setActiveIndex(currentIndex - 1)
    }
  }, [])

  const getItem = useCallback((index: number | null) => {
    if (index === null) return undefined
    return registrationsRef.current[index]
  }, [])

  const open = useCallback(
    (index: number) => {
      const registration = registrationsRef.current[index]
      if (!registration || registration.disabled) return

      measureMenu()

      if (activeIndexRef.current === index) {
        closingIndexRef.current = index
        activeIndexRef.current = null
        setActiveIndex(null)
        onChangeRef.current?.(null)
        return
      }

      closingIndexRef.current = null
      activeIndexRef.current = index
      setActiveIndex(index)
      onChangeRef.current?.(index)
    },
    [measureMenu],
  )

  const close = useCallback(() => {
    const currentIndex = activeIndexRef.current
    if (currentIndex === null) return

    closingIndexRef.current = currentIndex
    activeIndexRef.current = null
    setActiveIndex(null)
    onChangeRef.current?.(null)
  }, [])

  const toggle = useCallback(
    (index: number) => {
      open(index)
    },
    [open],
  )

  const notifyPopupOpened = useCallback(() => {
    const registration = registrationsRef.current[activeIndexRef.current ?? -1]
    registration?.onOpened?.()
  }, [])

  const notifyPopupClosed = useCallback(() => {
    const registration = registrationsRef.current[closingIndexRef.current ?? -1]
    closingIndexRef.current = null
    registration?.onClosed?.()
  }, [])

  const menuProps = useMemo<DropdownMenuProps>(
    () => ({
      activeColor,
      children,
      closeOnPressOverlay,
      direction,
      duration,
      overlay,
      style,
      styles,
      swipeThreshold,
      zIndex,
    }),
    [
      activeColor,
      children,
      closeOnPressOverlay,
      direction,
      duration,
      overlay,
      style,
      styles,
      swipeThreshold,
      zIndex,
    ],
  )

  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({
      activeColor: activeColor ?? token.activeColor,
      activeIndex,
      close,
      closeOnPressOverlay,
      direction,
      duration: duration ?? token.animationDuration,
      getItem,
      menuProps,
      menuStyles: styles,
      notifyItemUpdate,
      notifyPopupClosed,
      notifyPopupOpened,
      open,
      overlay,
      registerItem,
      toggle,
      unregisterItem,
      updateItem,
      zIndex: zIndex ?? token.zIndex,
      itemVersion,
    }),
    [
      activeColor,
      activeIndex,
      close,
      closeOnPressOverlay,
      direction,
      duration,
      getItem,
      menuProps,
      notifyItemUpdate,
      notifyPopupClosed,
      notifyPopupOpened,
      open,
      overlay,
      registerItem,
      toggle,
      unregisterItem,
      updateItem,
      zIndex,
      itemVersion,
      token.activeColor,
      token.animationDuration,
      token.zIndex,
      styles,
    ],
  )

  useImperativeHandle(ref, () => ({ open, close, toggle }), [close, open, toggle])

  const resolvedMenuStyles = getDropdownMenuStyles(token)
  const semantic = resolveStyles(styles, {
    props: menuProps,
    state: {
      active: activeIndex !== null,
      disabled: false,
      index: activeIndex ?? -1,
    },
  })
  const itemCount = Children.count(children)
  const isScrollable = Number.isFinite(swipeThreshold) && itemCount > Math.max(0, swipeThreshold)
  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event)
    const nextHeight = event.nativeEvent.layout.height
    if (nextHeight > 0) {
      setLayout((current) =>
        current.height === nextHeight ? current : { ...current, height: nextHeight },
      )
    }
    measureMenu()
  }

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <View
        ref={menuRef}
        {...viewProps}
        onLayout={handleLayout}
        style={[resolvedMenuStyles.root, semantic?.root, style]}
      >
        {isScrollable ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, minWidth: '100%' }}
          >
            <View style={{ flexDirection: 'row', flex: 1, minWidth: '100%' }}>{children}</View>
          </ScrollView>
        ) : (
          children
        )}
      </View>
      <DropdownPopupBridge
        layout={layout}
        tokenDuration={token.animationDuration}
        windowHeight={windowHeight}
      />
    </DropdownMenuContext.Provider>
  )
})

DropdownMenu.displayName = 'DropdownMenu'

function DropdownPopupBridge({
  layout,
  tokenDuration,
  windowHeight,
}: {
  layout: MenuLayout
  tokenDuration: number
  windowHeight: number
}) {
  const context = useContext(DropdownMenuContext)
  if (!context) return null

  const item = context.getItem(context.activeIndex)
  return (
    <DropdownPopup
      visible={context.activeIndex !== null}
      direction={context.direction}
      overlay={context.overlay}
      closeOnPressOverlay={context.closeOnPressOverlay}
      duration={context.duration ?? tokenDuration}
      zIndex={context.zIndex}
      menuTop={layout.y}
      menuBottom={layout.y + layout.height}
      windowHeight={windowHeight}
      item={item}
      panelStyle={item?.contentStyle}
      overlayStyle={item?.overlayStyle}
      panelContent={item?.content}
      panelContentKey={item?.index}
      onRequestClose={context.close}
      onOpened={context.notifyPopupOpened}
      onClosed={context.notifyPopupClosed}
    />
  )
}
