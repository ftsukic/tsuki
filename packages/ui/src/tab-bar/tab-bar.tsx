import { BottomBar } from '../bottom-bar'
import { useControllableValue } from '../hooks'
import { useToken } from '../theme'
import type { TabBarProps, TabValue } from './interface'
import isNil from 'lodash/isNil'
import { memo, useEffect, useRef, useState } from 'react'
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native'

export function TabBar<T extends TabValue>({
  theme,
  textColor,
  iconColor,
  activeTextColor,
  activeIconColor,
  options,
  indicator = false,
  indicatorWidth,
  indicatorHeight,
  indicatorColor,
  tabAlign = 'center',
  labelBulge = false,
  height,
  style,
  value,
  defaultValue,
  onChange,
  ...props
}: TabBarProps<T>) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.TabBar, ...theme }
  const [selected, setSelected] = useControllableValue<T>(
    value === undefined
      ? { defaultValue: defaultValue ?? options[0]?.value, onChange }
      : { value, onChange },
  )
  const [barWidth, setBarWidth] = useState(0)
  const [itemLayouts, setItemLayouts] = useState<{ x: number; width: number }[]>([])
  const indicatorLeft = useRef(new Animated.Value(0)).current
  const indicatorSize = useRef(new Animated.Value(0)).current
  const activeIndex = options.findIndex((item) => item.value === selected)
  const resolvedHeight = height ?? (indicator ? 40 : undefined)
  useEffect(() => {
    const layout = itemLayouts[activeIndex]
    if (!layout) return
    const width =
      indicatorWidth === undefined
        ? layout.width
        : indicatorWidth === 0
          ? layout.width
          : indicatorWidth
    Animated.parallel([
      Animated.timing(indicatorLeft, {
        toValue: layout.x + (layout.width - width) / 2,
        duration: themeToken.motionDurationMid,
        useNativeDriver: false,
      }),
      Animated.timing(indicatorSize, {
        toValue: width,
        duration: themeToken.motionDurationMid,
        useNativeDriver: false,
      }),
    ]).start()
  }, [
    activeIndex,
    indicatorLeft,
    indicatorSize,
    indicatorWidth,
    itemLayouts,
    themeToken.motionDurationMid,
  ])
  const items = options.map((item, index) => {
    const active = item.value === selected
    return (
      <TouchableOpacity
        key={String(item.value)}
        onPress={() => !active && setSelected(item.value)}
        onLayout={(event) =>
          setItemLayouts((layouts) => {
            const next = [...layouts]
            next[index] = { x: event.nativeEvent.layout.x, width: event.nativeEvent.layout.width }
            return next
          })
        }
        style={{
          paddingHorizontal: token.itemPaddingHorizontal,
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flex: tabAlign === 'center' ? 1 : undefined,
        }}
      >
        {item.iconRender?.(
          active ? (activeIconColor ?? token.activeIconColor) : (iconColor ?? token.iconColor),
          active,
        )}
        <Text
          style={{
            fontSize: item.iconRender ? token.textFontSize : token.textAloneFontSize,
            marginTop: item.iconRender ? token.textMarginTop : 0,
            color: active
              ? (activeTextColor ?? token.activeTextColor)
              : (textColor ?? token.textColor),
            transform:
              active && labelBulge
                ? [{ scale: typeof labelBulge === 'number' ? labelBulge : 1.2 }]
                : undefined,
          }}
        >
          {item.label}
          {!isNil(item.badge) ? (
            <Text
              style={{ fontSize: token.badgeFontSize, color: token.badgeColor }}
            >{` ${item.badge}`}</Text>
          ) : null}
        </Text>
      </TouchableOpacity>
    )
  })
  const content =
    tabAlign === 'center' ? (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {items}
        {indicator ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 0,
              left: indicatorLeft,
              width: indicatorSize,
              height: indicatorHeight ?? token.indicatorHeight,
              backgroundColor: indicatorColor ?? token.indicatorColor,
            }}
          />
        ) : null}
      </View>
    ) : (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        contentContainerStyle={{ minWidth: barWidth, flexGrow: 1, alignItems: 'center' }}
      >
        {items}
        {indicator ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 0,
              left: indicatorLeft,
              width: indicatorSize,
              height: indicatorHeight ?? token.indicatorHeight,
              backgroundColor: indicatorColor ?? token.indicatorColor,
            }}
          />
        ) : null}
      </ScrollView>
    )
  return (
    <BottomBar
      {...props}
      height={resolvedHeight}
      style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {content}
    </BottomBar>
  )
}

export default memo(TabBar) as typeof TabBar
