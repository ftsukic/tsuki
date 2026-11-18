import type { ClassValue } from 'clsx'
import { cn } from './cn'
import type { ClassNames } from '../types'

export function semanticClassName<Slots extends string>(
  classNames: ClassNames<Slots> | undefined,
  slot: Slots,
  ...classValues: ClassValue[]
): string {
  return cn(...classValues, classNames?.[slot])
}
