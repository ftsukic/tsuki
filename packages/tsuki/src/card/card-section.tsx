import { createElement } from 'react'
import { View } from 'react-native'
import { cn } from '../style/cn'
import { nativeWindVariables } from '../style/nativewind-variables'
import { useTsukiTheme } from '../theme/theme'
import type { CardHeaderProps } from './types'

export function CardSection({
  token,
  padding,
  className,
  style,
  ...viewProps
}: CardHeaderProps & { token: 'headerPadding' | 'bodyPadding' | 'footerPadding' }) {
  const {
    components: { Card: tokens },
  } = useTsukiTheme()
  const resolvedPadding = padding ?? tokens[token]
  const variables = className
    ? nativeWindVariables({ '--tsuki-card-section-padding-value': resolvedPadding })
    : undefined
  const props = {
    ...viewProps,
    className: variables
      ? cn('p-[var(--tsuki-card-section-padding-value)] will-change-variable', className)
      : className,
    style: [variables ?? { padding: resolvedPadding }, style],
  }
  return createElement(View, props)
}
