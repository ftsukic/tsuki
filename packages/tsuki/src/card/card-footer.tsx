import { forwardRef } from 'react'
import type { ComponentRef } from 'react'
import type { View } from 'react-native'
import { CardSection } from './card-section'
import type { CardFooterProps } from './types'

export const CardFooter = forwardRef<ComponentRef<typeof View>, CardFooterProps>(
  function CardFooter(props, ref) {
    return <CardSection {...props} ref={ref} token="footerPadding" />
  },
)

CardFooter.displayName = 'CardFooter'
