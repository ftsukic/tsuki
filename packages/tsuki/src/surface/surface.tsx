import { createElement } from 'react'
import { StyleSheet, View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { cn } from '../style/cn'
import { nativeWindVariables } from '../style/nativewind-variables'
import { useTsukiTheme } from '../theme/theme'
import type { SurfaceProps } from './types'

const overflowClasses = {
  hidden: 'overflow-hidden',
  visible: 'overflow-visible',
  scroll: undefined,
} satisfies Record<NonNullable<ViewStyle['overflow']>, string | undefined>

export function Surface({
  background,
  radius,
  padding,
  bordered = false,
  borderColor,
  borderWidth,
  inset = false,
  overflow = 'hidden',
  className,
  style,
  ...viewProps
}: SurfaceProps) {
  const {
    semantic,
    components: { Surface: tokens },
  } = useTsukiTheme()
  const layout: ViewStyle = {
    backgroundColor: background ?? semantic.colorSurface,
    borderRadius: radius ?? tokens.borderRadius,
    padding: padding ?? tokens.padding,
    marginHorizontal: inset ? tokens.padding : 0,
    overflow,
    ...(bordered && {
      borderColor: borderColor ?? semantic.colorBorder,
      borderWidth: borderWidth ?? tokens.borderWidth,
    }),
  }
  const variables = className
    ? nativeWindVariables({
        '--tsuki-surface-bg': background ?? semantic.colorSurface,
        '--tsuki-surface-radius': radius ?? tokens.borderRadius,
        '--tsuki-surface-padding-value': padding ?? tokens.padding,
        '--tsuki-surface-inset-value': inset ? tokens.padding : 0,
        ...(bordered && {
          '--tsuki-surface-stroke': borderColor ?? semantic.colorBorder,
          '--tsuki-surface-stroke-width': borderWidth ?? tokens.borderWidth,
        }),
      })
    : undefined

  const inline = variables ? StyleSheet.flatten(style) : undefined
  const horizontalMargin = inline?.marginHorizontal ?? inline?.margin
  const margins =
    horizontalMargin == null
      ? undefined
      : {
          marginLeft: inline?.marginLeft ?? horizontalMargin,
          marginRight: inline?.marginRight ?? horizontalMargin,
        }
  const props = {
    ...viewProps,
    className: variables
      ? cn(
          'bg-[color:var(--tsuki-surface-bg)] rounded-[var(--tsuki-surface-radius)]',
          'p-[var(--tsuki-surface-padding-value)] mx-[var(--tsuki-surface-inset-value)] will-change-variable',
          overflowClasses[overflow],
          bordered &&
            'border-[length:var(--tsuki-surface-stroke-width)] border-[color:var(--tsuki-surface-stroke)]',
          className,
        )
      : className,
    // NativeWind does not compile overflow: scroll on every consumer.
    style: variables
      ? [variables, overflow === 'scroll' && { overflow }, style, margins]
      : [layout, style],
  }
  return createElement(View, props)
}
