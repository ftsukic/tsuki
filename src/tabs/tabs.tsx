import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Animated, Easing, Platform, ScrollView, StyleSheet, View } from 'react-native'
import type {
  LayoutChangeEvent,
  StyleProp,
  TextStyle,
  View as ViewComponent,
  ViewStyle,
} from 'react-native'
import { InteractionPressable } from '../interaction'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { Tab } from './tab'
import { Swipe } from '../swipe'
import type { SwipeRef } from '../swipe'
import { TabsContext } from './tabs-context'
import type {
  TabProps,
  TabsProps,
  TabsSemanticStyles,
  TabsStyleState,
  TabsType,
  TabsValue,
} from './types'
import { getTabStyles, getTabsStyles } from './style'
import { getTabsToken } from './token'

interface NormalizedTab {
  element: ReactElement<TabProps>
  index: number
  value: TabsValue
}

interface TabLayout {
  width: number
  x: number
}

interface TabScrollOffsetOptions {
  activeLayout?: TabLayout
  viewportWidth: number
  contentWidth: number
}

export function getTabScrollOffset({
  activeLayout,
  viewportWidth,
  contentWidth,
}: TabScrollOffsetOptions): number {
  if (
    !activeLayout ||
    !Number.isFinite(activeLayout.x) ||
    !Number.isFinite(activeLayout.width) ||
    !Number.isFinite(viewportWidth) ||
    !Number.isFinite(contentWidth) ||
    activeLayout.width <= 0 ||
    viewportWidth <= 0 ||
    contentWidth <= 0
  ) {
    return 0
  }

  const centered = activeLayout.x + activeLayout.width / 2 - viewportWidth / 2
  const maximum = Math.max(0, contentWidth - viewportWidth)
  return Math.min(Math.max(centered, 0), maximum)
}

function isTabElement(value: unknown): value is ReactElement<TabProps> {
  return isValidElement(value) && value.type === Tab
}

function getTabValue(name: TabsValue | undefined, index: number): TabsValue {
  return name ?? index
}

function resolveInitialValue(
  items: readonly NormalizedTab[],
  defaultValue: TabsValue | undefined,
): TabsValue | undefined {
  const firstEnabledValue = items.find((item) => !item.element.props.disabled)?.value
  const defaultItem = items.find(
    (item) => Object.is(item.value, defaultValue) && !item.element.props.disabled,
  )

  return defaultItem?.value ?? firstEnabledValue ?? items[0]?.value
}

function hasContent(children: TabProps['children']): boolean {
  return children !== undefined && children !== null && children !== false
}

function renderTextContent(value: ReactNode, style?: StyleProp<TextStyle>) {
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
  }
  return value
}

interface TabHeaderProps {
  item: NormalizedTab
  resolvedStyles: ReturnType<typeof getTabsStyles>
  semanticStyles: TabsSemanticStyles | undefined
  token: ReturnType<typeof getTabsToken>
  type: TabsType
  onLayout: (index: number, event: LayoutChangeEvent) => void
}

function TabHeader({
  item,
  resolvedStyles,
  semanticStyles,
  token,
  type,
  onLayout,
}: TabHeaderProps) {
  const context = useContext(TabsContext)
  if (!context) return null

  const {
    accessibilityRole,
    accessibilityState,
    children,
    disabled = false,
    name,
    onLayout: userOnLayout,
    style,
    title,
    titleStyle,
    ...pressableProps
  } = item.element.props
  void children
  void name
  const active = context.isActive(item.value)
  const baseStyle = StyleSheet.flatten(resolvedStyles.tab) as ViewStyle
  const labelStyle = getTabStyles(
    token,
    type,
    {
      active,
      disabled,
      pressed: false,
    },
    baseStyle,
  ).label

  return (
    <InteractionPressable
      {...pressableProps}
      accessibilityRole={accessibilityRole ?? 'tab'}
      accessibilityState={{ ...accessibilityState, disabled, selected: active }}
      disabled={disabled}
      onLayout={(event) => {
        onLayout(item.index, event)
        userOnLayout?.(event)
      }}
      onPress={() => context.select(item.value)}
      style={({ pressed }) => [
        getTabStyles(token, type, { active, disabled, pressed }, baseStyle).root,
        semanticStyles?.tab,
        style,
      ]}
    >
      {typeof title === 'string' || typeof title === 'number' ? (
        <Text style={[labelStyle, semanticStyles?.label, titleStyle]}>{title}</Text>
      ) : (
        title
      )}
    </InteractionPressable>
  )
}

const TabsComponent = forwardRef<ViewComponent, TabsProps>(function Tabs(
  {
    children,
    value,
    defaultValue,
    onChange,
    type = 'line',
    animated = false,
    swipeable = false,
    scrollable = false,
    shrink = false,
    lazyRender = true,
    style,
    styles,
    ...viewProps
  },
  ref,
) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Tabs', getTabsToken)
  const tabElements = useMemo(() => Children.toArray(children).filter(isTabElement), [children])
  const items = useMemo<NormalizedTab[]>(
    () =>
      tabElements.map((element, index) => ({
        element,
        index,
        value: getTabValue(element.props.name, index),
      })),
    [tabElements],
  )
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState<TabsValue | undefined>(() =>
    resolveInitialValue(items, defaultValue),
  )
  const defaultValueRef = useRef(defaultValue)
  const initialResolutionDoneRef = useRef(internalValue !== undefined)
  const activeValue = controlled ? value : internalValue
  const activeIndex = items.findIndex((item) => Object.is(item.value, activeValue))
  useEffect(() => {
    if (controlled) return

    const activeItem = items.find((item) => Object.is(item.value, internalValue))
    if (activeItem && !activeItem.element.props.disabled) {
      initialResolutionDoneRef.current = true
      return
    }

    const fallback = resolveInitialValue(
      items,
      initialResolutionDoneRef.current ? undefined : defaultValueRef.current,
    )
    if (fallback === undefined) return
    initialResolutionDoneRef.current = true
    if (!Object.is(fallback, internalValue)) setInternalValue(fallback)
  }, [controlled, internalValue, items])
  const initialSwipeRef = useRef(Math.max(0, activeIndex))
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex
  const resolvedScrollable = scrollable || shrink
  const tabMotionEnabled = themeToken.motion !== false
  const contentMotionEnabled = animated && tabMotionEnabled
  const [layouts, setLayouts] = useState<readonly TabLayout[]>([])
  const navScrollRef = useRef<ScrollView>(null)
  const [navViewportWidth, setNavViewportWidth] = useState(0)
  const [navContentWidth, setNavContentWidth] = useState(0)
  const lastNavScrollOffsetRef = useRef<number | null>(null)
  const indicatorX = useRef(new Animated.Value(0)).current
  const indicatorAnimation = useRef<Animated.CompositeAnimation | null>(null)
  const resolvedStyles = useMemo(
    () => getTabsStyles(token, type, scrollable, shrink),
    [scrollable, shrink, token, type],
  )
  const tabsProps = useMemo<TabsProps>(
    () => ({
      children,
      value,
      defaultValue,
      onChange,
      type,
      animated,
      swipeable,
      scrollable,
      shrink,
      lazyRender,
      style,
      styles,
    }),
    [
      animated,
      children,
      defaultValue,
      lazyRender,
      onChange,
      scrollable,
      shrink,
      style,
      styles,
      swipeable,
      type,
      value,
    ],
  )
  const styleState: TabsStyleState = {
    activeIndex,
    activeValue,
    type,
    scrollable: resolvedScrollable,
  }
  const semanticStyles = resolveStyles(styles, { props: tabsProps, state: styleState })

  const setTabLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout
    if (!Number.isFinite(width) || !Number.isFinite(x)) return

    setLayouts((current) => {
      const next = [...current]
      if (next[index]?.width === width && next[index]?.x === x) return current
      next[index] = { width, x }
      return next
    })
  }, [])

  const activeLayout = activeIndex >= 0 ? layouts[activeIndex] : undefined
  const indicatorTarget = activeLayout
    ? activeLayout.x + (activeLayout.width - token.indicatorWidth) / 2
    : undefined
  const navScrollOffset = getTabScrollOffset({
    activeLayout,
    contentWidth: navContentWidth,
    viewportWidth: navViewportWidth,
  })

  const handleNavLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    if (!Number.isFinite(width)) return
    setNavViewportWidth((current) => (current === width ? current : width))
  }, [])

  const handleNavContentSizeChange = useCallback((width: number) => {
    if (!Number.isFinite(width)) return
    setNavContentWidth((current) => (current === width ? current : width))
  }, [])

  useEffect(() => {
    if (!resolvedScrollable) {
      lastNavScrollOffsetRef.current = null
      return
    }
    if (!activeLayout || navViewportWidth <= 0 || navContentWidth <= 0) return
    if (lastNavScrollOffsetRef.current === navScrollOffset) return

    lastNavScrollOffsetRef.current = navScrollOffset
    navScrollRef.current?.scrollTo({
      x: navScrollOffset,
      y: 0,
      animated: tabMotionEnabled,
    })
  }, [
    activeIndex,
    activeLayout,
    tabMotionEnabled,
    navContentWidth,
    navScrollOffset,
    navViewportWidth,
    resolvedScrollable,
  ])

  useEffect(() => {
    if (indicatorTarget === undefined) return

    indicatorAnimation.current?.stop()
    const duration = tabMotionEnabled ? Math.max(0, token.animationDuration) : 0
    if (duration === 0) {
      indicatorX.setValue(indicatorTarget)
      return
    }

    const animation = Animated.timing(indicatorX, {
      duration,
      easing: Easing.out(Easing.ease),
      toValue: indicatorTarget,
      useNativeDriver: Platform.OS !== 'web',
    })
    indicatorAnimation.current = animation
    animation.start()

    return () => animation.stop()
  }, [indicatorTarget, indicatorX, tabMotionEnabled, token.animationDuration])

  useEffect(
    () => () => {
      indicatorAnimation.current?.stop()
    },
    [],
  )

  const selectValue = useCallback(
    (nextValue: TabsValue) => {
      const item = items.find((candidate) => Object.is(candidate.value, nextValue))
      if (!item || item.element.props.disabled) return false
      if (Object.is(activeValue, nextValue)) return false
      if (!controlled) setInternalValue(nextValue)
      onChange?.(nextValue)
      return true
    },
    [activeValue, controlled, items, onChange],
  )

  const swipeRef = useRef<SwipeRef>(null)
  useEffect(() => {
    if (activeIndex >= 0) {
      swipeRef.current?.swipeTo(activeIndex, {
        emitChange: false,
        immediate: !contentMotionEnabled,
      })
    }
  }, [activeIndex, contentMotionEnabled])

  const handleSwipeChange = useCallback(
    (next: number) => {
      const item = items[next]
      const restoreIndex = activeIndexRef.current
      if (!item || item.element.props.disabled) {
        if (restoreIndex >= 0) {
          swipeRef.current?.swipeTo(restoreIndex, { emitChange: false, immediate: true })
        }
        return
      }

      selectValue(item.value)
      if (controlled && restoreIndex >= 0) {
        swipeRef.current?.swipeTo(activeIndexRef.current, {
          emitChange: false,
          immediate: !contentMotionEnabled,
        })
      }
    },
    [contentMotionEnabled, controlled, items, selectValue],
  )

  const contextValue = useMemo(
    () => ({
      activeValue,
      isActive: (nextValue: TabsValue) => Object.is(activeValue, nextValue),
      select: selectValue,
    }),
    [activeValue, selectValue],
  )

  const indicator =
    type === 'line' && activeLayout && indicatorTarget !== undefined ? (
      <Animated.View
        pointerEvents="none"
        style={[
          resolvedStyles.indicator,
          semanticStyles?.indicator,
          { transform: [{ translateX: indicatorX }] },
        ]}
        testID="tabs-indicator"
      />
    ) : null

  const tabHeaders = items.map((item) => (
    <TabHeader
      key={item.element.key ?? item.index}
      item={item}
      onLayout={setTabLayout}
      resolvedStyles={resolvedStyles}
      semanticStyles={semanticStyles}
      token={token}
      type={type}
    />
  ))

  const navigation = (
    <View
      onLayout={handleNavLayout}
      style={[resolvedStyles.nav, semanticStyles?.nav]}
      testID="tabs-nav"
    >
      {resolvedScrollable ? (
        <ScrollView
          ref={navScrollRef}
          horizontal
          contentContainerStyle={resolvedStyles.navContent}
          onContentSizeChange={handleNavContentSizeChange}
          showsHorizontalScrollIndicator={false}
          testID="tabs-nav-scroll"
        >
          {tabHeaders}
          {indicator}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
          {tabHeaders}
          {indicator}
        </View>
      )}
    </View>
  )

  const hasPaneContent = items.some((item) => hasContent(item.element.props.children))
  const contentTestID =
    typeof viewProps.testID === 'string' ? `${viewProps.testID}-content` : undefined
  const content = hasPaneContent ? (
    <Swipe
      ref={swipeRef}
      autoHeight
      duration={contentMotionEnabled ? token.animationDuration : 0}
      initialSwipe={initialSwipeRef.current}
      loop={false}
      lazyRender={lazyRender}
      showIndicators={false}
      style={[resolvedStyles.content, semanticStyles?.content]}
      testID={contentTestID}
      touchable={swipeable}
      onChange={handleSwipeChange}
    >
      {items.map((item) => (
        <Swipe.Item key={item.element.key ?? item.index}>
          {hasContent(item.element.props.children)
            ? renderTextContent(item.element.props.children)
            : null}
        </Swipe.Item>
      ))}
    </Swipe>
  ) : null

  return (
    <TabsContext.Provider value={contextValue}>
      <View
        ref={ref}
        {...viewProps}
        accessibilityRole={viewProps.accessibilityRole ?? 'tablist'}
        style={[resolvedStyles.root, semanticStyles?.root, style]}
      >
        {navigation}
        {content}
      </View>
    </TabsContext.Provider>
  )
})

export const Tabs = Object.assign(TabsComponent, { Tab })

Tabs.displayName = 'Tabs'
