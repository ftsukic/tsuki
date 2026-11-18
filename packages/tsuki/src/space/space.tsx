import { createElement } from 'react'
import { StyleSheet, View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { cn } from '../style/cn'
import type { SpaceProps } from './types'

const alignClasses = {
  'flex-start': 'items-start',
  'flex-end': 'items-end',
  center: 'items-center',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} satisfies Record<NonNullable<SpaceProps['align']>, string>

function getGapVariable(gap: number): ViewStyle | undefined {
  let nativewind: { vars: (values: Record<string, number>) => ViewStyle }
  try {
    // Metro treats requires in a try block as optional dependencies.
    // eslint-disable-next-line ts/no-require-imports
    nativewind = require('nativewind')
  } catch (error) {
    if (error instanceof ReferenceError && typeof require === 'undefined') return undefined
    if (
      error instanceof Error &&
      /Cannot find module .*nativewind|Requiring unknown module/.test(error.message)
    ) {
      return undefined
    }
    throw error
  }
  return nativewind.vars({ '--tsuki-space-gap': gap })
}

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
  const variables = className ? getGapVariable(gap ?? 0) : undefined

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
