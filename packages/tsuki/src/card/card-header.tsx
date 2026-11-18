import { CardSection } from './card-section'
import type { CardHeaderProps } from './types'

export function CardHeader(props: CardHeaderProps) {
  return <CardSection {...props} token="headerPadding" />
}
