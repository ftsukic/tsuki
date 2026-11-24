import { createElement, forwardRef } from 'react'
import type { ComponentRef, RefAttributes } from 'react'
import { View } from 'react-native'
import type { ViewProps } from 'react-native'
import { cn } from '../style/cn'
import type { CardHeaderProps } from './types'

const sectionPaddingClasses = {
  headerPadding: 'p-tsuki-card-header',
  bodyPadding: 'p-tsuki-card-body',
  footerPadding: 'p-tsuki-card-footer',
} as const

export const CardSection = forwardRef<
  ComponentRef<typeof View>,
  CardHeaderProps & { token: keyof typeof sectionPaddingClasses }
>(function CardSection({ token, padding, className, style, ...viewProps }, ref) {
  const props = {
    ...viewProps,
    ref,
    className: cn(sectionPaddingClasses[token], className),
    style: padding !== undefined ? [{ padding }, style] : style,
  } as ViewProps & RefAttributes<ComponentRef<typeof View>> & { className?: string }

  return createElement(View, props)
})

CardSection.displayName = 'CardSection'
