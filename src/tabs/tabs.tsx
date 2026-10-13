import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useMotionValue } from '../motion/useMotionValue'
import { LAYOUT_PRESET } from '../motion/presets'
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactElement, ReactNode } from 'react'
import { I18nManager, Platform, ScrollView, StyleSheet, View } from 'react-native'
import type {
  LayoutChangeEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  View as ViewComponent,
  ViewStyle,
} from 'react-native'
import { Pressable } from '../pressable'
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
  panelID: string
  tabID: string
  value: TabsValue
}

type TabPressableProps = PressableProps & { 'aria-controls'?: string }

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

function hasDuplicateTabValues(items: readonly NormalizedTab[]): boolean {
  return items.some((item, index) =>
    items.slice(0, index).some((previous) => Object.is(previous.value, item.value)),
  )
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
  active: boolean
  item: NormalizedTab
  resolvedStyles: ReturnType<typeof getTabsStyles>
  semanticStyles: TabsSemanticStyles | undefined
  token: ReturnType<typeof getTabsToken>
  type: TabsType
  onLayout: (index: number, event: LayoutChangeEvent) => void
  onFocusChange: (tabID: string, focused: boolean) => void
  hasPanel: boolean
  tabIndex?: 0 | -1
}

function TabHeader({
  active,
  item,
  resolvedStyles,
  semanticStyles,
  token,
  type,
  onLayout,
  onFocusChange,
  hasPanel,
  tabIndex,
}: TabHeaderProps) {
  const context = useContext(TabsContext)
  if (!context) return null

  const {
    accessibilityRole,
    accessibilityState,
    children,
    disabled = false,
    name,
    nativeID,
    onBlur: userOnBlur,
    onFocus: userOnFocus,
    onLayout: userOnLayout,
    style,
    tabIndex: userTabIndex,
    title,
    styles: itemStyles,
    ...pressableProps
  } = item.element.props
  void children
  void name
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
  const accessibilityProps: TabPressableProps = {
    nativeID: nativeID ?? item.tabID,
    'aria-controls': Platform.OS === 'web' && hasPanel ? item.panelID : undefined,
  }

  return (
    <Pressable
      {...pressableProps}
      {...accessibilityProps}
      accessibilityRole={accessibilityRole ?? 'tab'}
      accessibilityState={{ ...accessibilityState, disabled, selected: active }}
      tabIndex={userTabIndex ?? tabIndex}
      disabled={disabled}
      onFocus={(event) => {
        onFocusChange(item.tabID, true)
        userOnFocus?.(event)
      }}
      onBlur={(event) => {
        onFocusChange(item.tabID, false)
        userOnBlur?.(event)
      }}
      onLayout={(event) => {
        onLayout(item.index, event)
        userOnLayout?.(event)
      }}
      onPress={() => context.select(item.value)}
      pressStyle="none"
      style={({ pressed }) => [
        getTabStyles(token, type, { active, disabled, pressed }, baseStyle).root,
        semanticStyles?.item,
        itemStyles?.root,
        style,
      ]}
    >
      {typeof title === 'string' || typeof title === 'number' ? (
        <Text style={[labelStyle, semanticStyles?.label, itemStyles?.label]}>{title}</Text>
      ) : (
        title
      )}
    </Pressable>
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
  const {
    accessibilityHint: tabListAccessibilityHint,
    accessibilityLabel: tabListAccessibilityLabel,
    accessibilityLabelledBy: tabListAccessibilityLabelledBy,
    'aria-label': tabListAriaLabel,
    'aria-labelledby': tabListAriaLabelledBy,
    ...rootViewProps
  } = viewProps
  const generatedID = `tabs-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { token: themeToken } = useToken()
  const token = useComponentToken('Tabs', getTabsToken)
  const tabElements = useMemo(() => Children.toArray(children).filter(isTabElement), [children])
  const items = useMemo<NormalizedTab[]>(
    () =>
      tabElements.map((element, index) => ({
        element,
        index,
        panelID: `${generatedID}-panel-${index}`,
        tabID: element.props.nativeID ?? `${generatedID}-tab-${index}`,
        value: getTabValue(element.props.name, index),
      })),
    [generatedID, tabElements],
  )
  const [focusedTabID, setFocusedTabID] = useState<string | null>(null)
  const warnedDuplicateValuesRef = useRef(false)
  const duplicateValues = useMemo(() => hasDuplicateTabValues(items), [items])
  useEffect(() => {
    if (!duplicateValues) {
      warnedDuplicateValuesRef.current = false
      return
    }
    if (warnedDuplicateValuesRef.current) return
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error(
        'Tabs requires each Tab to resolve to a unique name; unnamed Tabs use their index.',
      )
    }
    warnedDuplicateValuesRef.current = true
  }, [duplicateValues, items])
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState<TabsValue | undefined>(() =>
    resolveInitialValue(items, defaultValue),
  )
  const defaultValueRef = useRef(defaultValue)
  const initialResolutionDoneRef = useRef(internalValue !== undefined)
  const activeValue = controlled ? value : internalValue
  const activeIndex = items.findIndex((item) => Object.is(item.value, activeValue))
  const firstEnabledIndex = items.findIndex((item) => !item.element.props.disabled)
  const focusedTab = items.find(
    (item) => item.tabID === focusedTabID && !item.element.props.disabled,
  )
  const activeTab = activeIndex >= 0 ? items[activeIndex] : undefined
  const tabStopID =
    focusedTab?.tabID ??
    (activeTab && !activeTab.element.props.disabled ? activeTab.tabID : undefined) ??
    items[firstEnabledIndex]?.tabID
  const hasPaneContent = items.some((item) => hasContent(item.element.props.children))
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

  const indicatorX = useMotionValue(
    indicatorTarget ?? 0,
    { ...LAYOUT_PRESET, duration: token.animationDuration },
    0,
    tabMotionEnabled,
  )
  const indicatorMotionStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }))

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
      select: selectValue,
    }),
    [selectValue],
  )

  const handleTabFocusChange = useCallback((tabID: string, focused: boolean) => {
    setFocusedTabID((current) => {
      if (focused) return tabID
      return current === tabID ? null : current
    })
  }, [])

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (Platform.OS !== 'web' || focusedTabID === null) return
      const enabledItems = items.filter((item) => !item.element.props.disabled)
      const currentIndex = enabledItems.findIndex((item) => item.tabID === focusedTabID)
      if (currentIndex < 0 || enabledItems.length === 0) return

      let nextIndex: number | undefined
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault()
        selectValue(enabledItems[currentIndex]!.value)
        return
      }
      if (event.key === 'Home') nextIndex = 0
      else if (event.key === 'End') nextIndex = enabledItems.length - 1
      else if (event.key === 'ArrowRight') {
        nextIndex =
          (currentIndex + (I18nManager.isRTL ? -1 : 1) + enabledItems.length) % enabledItems.length
      } else if (event.key === 'ArrowLeft') {
        nextIndex =
          (currentIndex + (I18nManager.isRTL ? 1 : -1) + enabledItems.length) % enabledItems.length
      }
      if (nextIndex === undefined) return

      event.preventDefault()
      const nextTab = enabledItems[nextIndex]
      if (!nextTab) return
      document.getElementById(nextTab.tabID)?.focus()
    },
    [focusedTabID, items, selectValue],
  )

  useEffect(() => {
    if (Platform.OS !== 'web' || focusedTabID === null || typeof window === 'undefined') return
    window.addEventListener('keydown', handleTabKeyDown)
    return () => window.removeEventListener('keydown', handleTabKeyDown)
  }, [focusedTabID, handleTabKeyDown])

  const indicator =
    type === 'line' && activeLayout && indicatorTarget !== undefined ? (
      <Animated.View
        pointerEvents="none"
        style={[resolvedStyles.indicator, semanticStyles?.indicator, indicatorMotionStyle]}
        testID="tabs-indicator"
      />
    ) : null

  const tabHeaders = items.map((item) => (
    <TabHeader
      key={item.element.key ?? item.index}
      item={item}
      active={item.index === activeIndex}
      onLayout={setTabLayout}
      onFocusChange={handleTabFocusChange}
      hasPanel={hasPaneContent}
      tabIndex={
        Platform.OS === 'web'
          ? item.element.props.disabled
            ? -1
            : item.tabID === tabStopID
              ? 0
              : -1
          : undefined
      }
      resolvedStyles={resolvedStyles}
      semanticStyles={semanticStyles}
      token={token}
      type={type}
    />
  ))

  const navigation = (
    <View
      accessibilityRole="tablist"
      accessibilityHint={tabListAccessibilityHint}
      accessibilityLabel={tabListAccessibilityLabel}
      accessibilityLabelledBy={tabListAccessibilityLabelledBy}
      aria-label={tabListAriaLabel}
      aria-labelledby={tabListAriaLabelledBy}
      onLayout={handleNavLayout}
      style={[resolvedStyles.nav, semanticStyles?.header]}
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
      style={[resolvedStyles.content, semanticStyles?.body]}
      testID={contentTestID}
      touchable={swipeable}
      onChange={handleSwipeChange}
    >
      {items.map((item) => (
        <Swipe.Item
          key={item.element.key ?? item.index}
          role="tabpanel"
          nativeID={item.panelID}
          accessibilityLabelledBy={item.tabID}
          aria-labelledby={item.tabID}
          style={[semanticStyles?.content, item.element.props.styles?.content]}
        >
          {hasContent(item.element.props.children)
            ? renderTextContent(item.element.props.children)
            : null}
        </Swipe.Item>
      ))}
    </Swipe>
  ) : null

  return (
    <TabsContext.Provider value={contextValue}>
      <View ref={ref} {...rootViewProps} style={[resolvedStyles.root, semanticStyles?.root, style]}>
        {navigation}
        {content}
      </View>
    </TabsContext.Provider>
  )
})

export const Tabs = Object.assign(TabsComponent, { Tab })

Tabs.displayName = 'Tabs'
