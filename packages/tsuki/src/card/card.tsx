import { forwardRef } from 'react'
import type { ComponentRef } from 'react'
import type { View } from 'react-native'
import { cn } from '../style/cn'
import { Surface } from '../surface'
import { CardBody } from './card-body'
import { CardFooter } from './card-footer'
import { CardHeader } from './card-header'
import type { CardProps } from './types'

const CardRoot = forwardRef<ComponentRef<typeof View>, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <Surface
      {...props}
      className={cn('rounded-tsuki-card p-tsuki-card gap-tsuki-card-gap', className)}
      ref={ref}
    />
  )
})

CardRoot.displayName = 'Card'

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
})
