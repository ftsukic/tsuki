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
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()
  const menuRef = useRef<ViewComponent>(null)
  const registrationsRef = useRef<DropdownItemRegistration[]>([])
  const activeIndexRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)
  const openRequestRef = useRef(0)
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

  const measureMenu = useCallback(
    (onMeasured?: () => void) => {
      const node = menuRef.current
      if (!node || typeof node.measureInWindow !== 'function') {
        onMeasured?.()
        return
      }

      let measured = false
      node.measureInWindow((x, y, width, measuredHeight) => {
        measured = true
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
        onMeasured?.()
      })

      // React Native's Jest host method is a no-op with a zero-argument mock.
      // Keep the fallback local to that shape; native measureInWindow resolves
      // through its callback before an open is committed.
      if (!measured && node.measureInWindow.length === 0) {
        onMeasured?.()
      }
    },
    [token.menuHeight],
  )

  useEffect(() => {
    measureMenu()
  }, [direction, measureMenu, windowHeight, windowWidth])

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
      openRequestRef.current += 1
      activeIndexRef.current = null
      setActiveIndex(null)
      onChangeRef.current?.(null)
    } else if (currentIndex !== null && currentIndex > removedIndex) {
      activeIndexRef.current = currentIndex - 1
      setActiveIndex(currentIndex - 1)
    }
  }, [])

  const open = useCallback(
    (index: number) => {
      const registration = registrationsRef.current[index]
      if (!registration || registration.disabled) return

      if (activeIndexRef.current === index) {
        openRequestRef.current += 1
        activeIndexRef.current = null
        setActiveIndex(null)
        onChangeRef.current?.(null)
        return
      }

      const requestId = ++openRequestRef.current
      const commit = () => {
        if (
          openRequestRef.current !== requestId ||
          registrationsRef.current[index] !== registration
        )
          return
        activeIndexRef.current = index
        setActiveIndex(index)
        onChangeRef.current?.(index)
      }

      // A closed menu must resolve its anchor before committing the active item.
      // Switching between already-open items reuses the current anchor and only
      // changes the panel content after the popup transition has settled.
      if (activeIndexRef.current === null) measureMenu(commit)
      else commit()
    },
    [measureMenu],
  )

  const close = useCallback(() => {
    const currentIndex = activeIndexRef.current
    openRequestRef.current += 1
    if (currentIndex === null) return

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

  const itemCount = Children.count(children)
  const threshold = Number.isFinite(swipeThreshold) ? Math.max(1, swipeThreshold) : itemCount
  const isScrollable = Number.isFinite(swipeThreshold) && itemCount > Math.max(0, swipeThreshold)
  const scrollableItemWidth = `${100 / Math.max(1, threshold)}%` as `${number}%`
  const panelMaxHeight =
    direction === 'down'
      ? Math.max(0, windowHeight - layout.y - layout.height)
      : Math.max(0, layout.y)
  const resolvedPanelMaxHeight = panelMaxHeight > 0 ? panelMaxHeight : undefined

  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({
      activeColor: activeColor ?? token.activeColor,
      activeIndex,
      activeItem: activeIndex === null ? undefined : registrationsRef.current[activeIndex],
      close,
      closeOnPressOverlay,
      direction,
      duration: duration ?? token.animationDuration,
      menuProps,
      menuStyles: styles,
      notifyItemUpdate,
      open,
      panelMaxHeight: resolvedPanelMaxHeight,
      overlay,
      registerItem,
      scrollable: isScrollable,
      scrollableItemWidth,
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
      menuProps,
      notifyItemUpdate,
      open,
      overlay,
      resolvedPanelMaxHeight,
      registerItem,
      isScrollable,
      scrollableItemWidth,
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

  return (
    <DropdownPopup
      visible={context.activeItem !== undefined}
      direction={context.direction}
      overlay={context.overlay}
      closeOnPressOverlay={context.closeOnPressOverlay}
      duration={context.duration ?? tokenDuration}
      zIndex={context.zIndex}
      menuTop={layout.y}
      menuBottom={layout.y + layout.height}
      windowHeight={windowHeight}
      activeItem={context.activeItem}
      onRequestClose={context.close}
    />
  )
}
