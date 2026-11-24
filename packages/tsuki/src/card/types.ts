import type { ViewProps } from 'react-native'
import type { SurfaceProps } from '../surface'

export type CardProps = SurfaceProps

export interface CardSectionProps extends ViewProps {
  padding?: number
  className?: string
}

export type CardHeaderProps = CardSectionProps
export type CardBodyProps = CardSectionProps
export type CardFooterProps = CardSectionProps
