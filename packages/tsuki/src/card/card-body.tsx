import { forwardRef } from 'react'
import type { ComponentRef } from 'react'
import type { View } from 'react-native'
import { CardSection } from './card-section'
import type { CardBodyProps } from './types'

export const CardBody = forwardRef<ComponentRef<typeof View>, CardBodyProps>(
  function CardBody(props, ref) {
    return <CardSection {...props} ref={ref} token="bodyPadding" />
  },
)

CardBody.displayName = 'CardBody'
