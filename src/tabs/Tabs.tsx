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
import { InteractionPressable, usePanGesture } from '../interaction'
import { resolveStyles } from '../style'
import { useControllableSelection } from '../selection/state'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { Tab } from './Tab'
import { TabsContext } from './TabsContext'
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

function isTabElement(value: unknown): value is ReactElement<TabProps> {
  return isValidElement(value) && value.type === Tab
}

function getTabValue(name: TabsValue | undefined, index: number): TabsValue {
  return name ?? index
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
        <Text style={[labelStyle, semanticStyles?.label]}>{title}</Text>
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
    animated = true,
    swipeable = false,
    scrollable = false,
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
  const firstValue = items.find((item) => !item.element.props.disabled)?.value ?? items[0]?.value
  const initialValue =
    defaultValue !== undefined && items.some((item) => Object.is(item.value, defaultValue))
      ? defaultValue
      : firstValue
  const selection = useControllableSelection({ value, defaultValue: initialValue, onChange })
  const selectSelection = selection.select
  const activeValue = selection.value
  const activeIndex = items.findIndex((item) => Object.is(item.value, activeValue))
  const activeItem = activeIndex >= 0 ? items[activeIndex] : undefined
  const [layouts, setLayouts] = useState<readonly TabLayout[]>([])
  const indicatorX = useRef(new Animated.Value(0)).current
  const indicatorAnimation = useRef<Animated.CompositeAnimation | null>(null)
  const resolvedStyles = useMemo(
    () => getTabsStyles(token, type, scrollable),
    [scrollable, token, type],
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
      style,
      styles,
    }),
    [animated, children, defaultValue, onChange, scrollable, style, styles, swipeable, type, value],
  )
  const styleState: TabsStyleState = { activeIndex, activeValue, type, scrollable }
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

  useEffect(() => {
    if (indicatorTarget === undefined) return

    indicatorAnimation.current?.stop()
    const duration = animated && themeToken.motion ? Math.max(0, token.animationDuration) : 0
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
  }, [animated, indicatorTarget, indicatorX, themeToken.motion, token.animationDuration])

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
      return selectSelection(nextValue)
    },
    [items, selectSelection],
  )

  const selectAdjacent = useCallback(
    (distance: number) => {
      if (activeIndex < 0 || distance === 0) return
      const direction = distance < 0 ? 1 : -1
      for (
        let index = activeIndex + direction;
        index >= 0 && index < items.length;
        index += direction
      ) {
        if (!items[index].element.props.disabled) {
          selectValue(items[index].value)
          return
        }
      }
    },
    [activeIndex, items, selectValue],
  )

  const contentEnabled =
    swipeable && activeItem !== undefined && hasContent(activeItem.element.props.children)
  const { panHandlers } = usePanGesture({
    axis: 'horizontal',
    distance: 8,
    enabled: contentEnabled,
    onEnd: ({ distance, velocity }) => {
      if (Math.abs(distance) < 40 && Math.abs(velocity) < 0.3) return
      selectAdjacent(distance)
    },
  })

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
    <View style={[resolvedStyles.nav, semanticStyles?.nav]}>
      {scrollable ? (
        <ScrollView
          horizontal
          contentContainerStyle={{ flexGrow: 1, position: 'relative' }}
          showsHorizontalScrollIndicator={false}
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

  const content =
    activeItem && hasContent(activeItem.element.props.children) ? (
      <View {...panHandlers} style={[resolvedStyles.content, semanticStyles?.content]}>
        {renderTextContent(activeItem.element.props.children)}
      </View>
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
