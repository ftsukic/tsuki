import { createElement, forwardRef } from 'react'
import type { ComponentRef, RefAttributes } from 'react'
import { View } from 'react-native'
import type { ViewProps, ViewStyle } from 'react-native'
import { cn } from '../style/cn'
import type { DividerProps } from './types'

export const Divider = forwardRef<ComponentRef<typeof View>, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    color,
    thickness,
    inset,
    className,
    style,
    role,
    accessibilityRole,
    pointerEvents = 'none',
    ...viewProps
  },
  ref,
) {
  const horizontal = orientation === 'horizontal'
  const propStyle: ViewStyle = {}
  if (color !== undefined) propStyle.backgroundColor = color
  if (thickness !== undefined) {
    if (horizontal) propStyle.height = thickness
    else propStyle.width = thickness
  }
  if (inset !== undefined && inset !== 0) {
    if (horizontal) propStyle.marginHorizontal = inset
    else propStyle.marginVertical = inset
  }
  const hasPropStyle = Object.keys(propStyle).length > 0

  const props = {
    accessible: true,
    ...viewProps,
    ref,
    role: role ?? (accessibilityRole === undefined ? 'separator' : undefined),
    accessibilityRole,
    pointerEvents,
    className: cn(
      'self-stretch bg-tsuki-border',
      horizontal ? 'h-tsuki-divider' : 'w-tsuki-divider',
      className,
    ),
    style: hasPropStyle ? [propStyle, style] : style,
  } as ViewProps & RefAttributes<ComponentRef<typeof View>> & { className?: string }

  return createElement(View, props)
})

Divider.displayName = 'Divider'
