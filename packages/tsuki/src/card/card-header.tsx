import { forwardRef } from 'react'
import type { ComponentRef } from 'react'
import type { View } from 'react-native'
import { CardSection } from './card-section'
import type { CardHeaderProps } from './types'

export const CardHeader = forwardRef<ComponentRef<typeof View>, CardHeaderProps>(
  function CardHeader(props, ref) {
    return <CardSection {...props} ref={ref} token="headerPadding" />
  },
)

CardHeader.displayName = 'CardHeader'
