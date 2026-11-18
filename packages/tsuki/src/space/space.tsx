import { createElement } from 'react'
import { StyleSheet, View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { cn } from '../style/cn'
import { nativeWindVariables } from '../style/nativewind-variables'
import type { SpaceProps } from './types'

const alignClasses = {
  'flex-start': 'items-start',
  'flex-end': 'items-end',
  center: 'items-center',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} satisfies Record<NonNullable<SpaceProps['align']>, string>

export function Space({
  direction = 'horizontal',
  gap,
  wrap = false,
  align,
  className,
  style,
  ...viewProps
}: SpaceProps) {
  const horizontal = direction === 'horizontal'
  const variables = className ? nativeWindVariables({ '--tsuki-space-gap': gap ?? 0 }) : undefined

  if (!variables) {
    const layout: ViewStyle = {
      flexDirection: horizontal ? 'row' : 'column',
      flexWrap: wrap ? 'wrap' : 'nowrap',
      gap,
      alignItems: align,
    }
    const rootProps = { ...viewProps, className, style: [layout, style] }
    return createElement(View, rootProps)
  }

  // Tailwind may compile gap utilities into axis-specific properties.
  const inline = StyleSheet.flatten(style)
  const inlineGap =
    inline?.gap == null
      ? undefined
      : {
          rowGap: inline.rowGap ?? inline.gap,
          columnGap: inline.columnGap ?? inline.gap,
        }
  const rootProps = {
    ...viewProps,
    className: cn(
      horizontal ? 'flex-row' : 'flex-col',
      wrap ? 'flex-wrap' : 'flex-nowrap',
      align && alignClasses[align],
      'gap-[var(--tsuki-space-gap)] will-change-variable',
      className,
    ),
    style: [variables, style, inlineGap],
  }
  return createElement(View, rootProps)
}
