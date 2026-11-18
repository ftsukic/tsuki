import { createElement } from 'react'
import { StyleSheet, View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { cn } from '../style/cn'
import { nativeWindVariables } from '../style/nativewind-variables'
import { useTsukiTheme } from '../theme/theme'
import type { DividerProps } from './types'

export function Divider({
  orientation = 'horizontal',
  color,
  thickness,
  inset = 0,
  className,
  style,
  role,
  accessibilityRole,
  pointerEvents = 'none',
  ...viewProps
}: DividerProps) {
  const theme = useTsukiTheme()
  const horizontal = orientation === 'horizontal'
  const backgroundColor = color ?? theme.semantic.colorBorder
  const size = thickness ?? theme.components.Divider.thickness
  const variables = className
    ? nativeWindVariables({
        '--tsuki-divider-color': backgroundColor,
        '--tsuki-divider-size': size,
        '--tsuki-divider-inset': inset,
      })
    : undefined
  const layout: ViewStyle = horizontal
    ? { height: size, marginHorizontal: inset }
    : { width: size, marginVertical: inset }
  const inline = variables ? StyleSheet.flatten(style) : undefined
  // Tailwind can expand axis margins into individual native properties.
  const marginHorizontal = inline?.marginHorizontal ?? inline?.margin
  const marginVertical = inline?.marginVertical ?? inline?.margin
  const margins = {
    ...(marginHorizontal != null && {
      marginLeft: inline?.marginLeft ?? marginHorizontal,
      marginRight: inline?.marginRight ?? marginHorizontal,
    }),
    ...(marginVertical != null && {
      marginTop: inline?.marginTop ?? marginVertical,
      marginBottom: inline?.marginBottom ?? marginVertical,
    }),
  }
  const props = {
    accessible: true,
    ...viewProps,
    role: role ?? (accessibilityRole === undefined ? 'separator' : undefined),
    accessibilityRole,
    pointerEvents,
    className: variables
      ? cn(
          'self-stretch bg-[color:var(--tsuki-divider-color)] will-change-variable',
          horizontal
            ? 'h-[var(--tsuki-divider-size)] mx-[var(--tsuki-divider-inset)]'
            : 'w-[var(--tsuki-divider-size)] my-[var(--tsuki-divider-inset)]',
          className,
        )
      : className,
    style: variables
      ? [variables, style, margins]
      : [{ alignSelf: 'stretch' as const, backgroundColor, ...layout }, style],
  }
  return createElement(View, props)
}
