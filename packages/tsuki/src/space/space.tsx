import { createElement, forwardRef } from 'react'
import type { ComponentRef, RefAttributes } from 'react'
import { View } from 'react-native'
import type { ViewProps } from 'react-native'
import { cn } from '../style/cn'
import type { SpaceProps } from './types'

const alignClasses = {
  'flex-start': 'items-start',
  'flex-end': 'items-end',
  center: 'items-center',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} satisfies Record<NonNullable<SpaceProps['align']>, string>

export const Space = forwardRef<ComponentRef<typeof View>, SpaceProps>(function Space(
  { direction = 'horizontal', gap, wrap = false, align, className, style, ...viewProps },
  ref,
) {
  const horizontal = direction === 'horizontal'
  const propStyle = gap !== undefined ? { gap } : undefined
  const rootProps = {
    ...viewProps,
    ref,
    className: cn(
      horizontal ? 'flex-row' : 'flex-col',
      wrap ? 'flex-wrap' : 'flex-nowrap',
      align && alignClasses[align],
      className,
    ),
    style: propStyle ? [propStyle, style] : style,
  } as ViewProps & RefAttributes<ComponentRef<typeof View>> & { className?: string }

  return createElement(View, rootProps)
})

Space.displayName = 'Space'
