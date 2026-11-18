import { CardSection } from './card-section'
import type { CardBodyProps } from './types'

export function CardBody(props: CardBodyProps) {
  return <CardSection {...props} token="bodyPadding" />
}
