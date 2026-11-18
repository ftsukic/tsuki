import type { VariantProps } from 'class-variance-authority'
import type { TextProps as NativeTextProps } from 'react-native'
import type { textVariants } from './text-variants'

export type TextVariant = NonNullable<VariantProps<typeof textVariants>['variant']>

export interface TextProps extends NativeTextProps {
  className?: string
  variant?: TextVariant
}
