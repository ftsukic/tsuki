import type { ClassValue } from 'clsx'
import { cn } from './cn'
import type { ClassNames } from '../types'

/**
 * Resolves a component slot's Tailwind classes in strict priority order:
 * base/default classes < semantic `classNames[slot]` < explicit primary `className`.
 */
export function semanticClassName<Slots extends string>(
  classNames: ClassNames<Slots> | undefined,
  slot: Slots,
  baseClassName?: ClassValue,
  overrideClassName?: ClassValue,
): string {
  return cn(baseClassName, classNames?.[slot], overrideClassName)
}
