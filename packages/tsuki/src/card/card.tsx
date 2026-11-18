import { Surface } from '../surface'
import { useTsukiTheme } from '../theme/theme'
import { CardBody } from './card-body'
import { CardFooter } from './card-footer'
import { CardHeader } from './card-header'
import type { CardProps } from './types'

function CardRoot({ radius, padding, gap, ...props }: CardProps) {
  const {
    components: { Card: tokens },
  } = useTsukiTheme()

  return (
    <Surface
      {...props}
      radius={radius ?? tokens.borderRadius}
      padding={padding ?? tokens.padding}
      gap={gap ?? tokens.gap}
    />
  )
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
})
