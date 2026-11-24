import { createElement, forwardRef } from 'react'
import type { ComponentRef, RefAttributes } from 'react'
import { View } from 'react-native'
import type { ViewProps, ViewStyle } from 'react-native'
import { cn } from '../style/cn'
import type { SurfaceProps } from './types'

const overflowClasses = {
  hidden: 'overflow-hidden',
  visible: 'overflow-visible',
  scroll: undefined,
} satisfies Record<NonNullable<ViewStyle['overflow']>, string | undefined>

export const Surface = forwardRef<ComponentRef<typeof View>, SurfaceProps>(function Surface(
  {
    background,
    radius,
    padding,
    gap,
    bordered = false,
    borderColor,
    borderWidth,
    inset = false,
    overflow = 'hidden',
    className,
    style,
    ...viewProps
  },
  ref,
) {
  const propStyle: ViewStyle = {}
  if (background !== undefined) propStyle.backgroundColor = background
  if (radius !== undefined) propStyle.borderRadius = radius
  if (padding !== undefined) propStyle.padding = padding
  if (gap !== undefined) propStyle.gap = gap
  if (overflow === 'scroll') propStyle.overflow = 'scroll'
  if (bordered) {
    if (borderColor !== undefined) propStyle.borderColor = borderColor
    if (borderWidth !== undefined) propStyle.borderWidth = borderWidth
  }
  const hasPropStyle = Object.keys(propStyle).length > 0

  const props = {
    ...viewProps,
    ref,
    className: cn(
      'bg-tsuki-surface rounded-tsuki-surface p-tsuki-surface',
      inset ? 'mx-tsuki-surface' : undefined,
      overflowClasses[overflow],
      bordered ? 'border-tsuki-surface-width border-tsuki-border' : undefined,
      className,
    ),
    style: hasPropStyle ? [propStyle, style] : style,
  } as ViewProps & RefAttributes<ComponentRef<typeof View>> & { className?: string }

  return createElement(View, props)
})

Surface.displayName = 'Surface'
