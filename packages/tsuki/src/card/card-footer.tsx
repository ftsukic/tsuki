import { CardSection } from './card-section'
import type { CardFooterProps } from './types'

export function CardFooter(props: CardFooterProps) {
  return <CardSection {...props} token="footerPadding" />
}
