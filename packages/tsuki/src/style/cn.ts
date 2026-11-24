import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import { TSUKI_TAILWIND_MERGE_EXTENSION } from './tsuki-tw-merge'

const mergeTailwindClasses = extendTailwindMerge({
  extend: TSUKI_TAILWIND_MERGE_EXTENSION,
})

export function cn(...inputs: ClassValue[]): string {
  return mergeTailwindClasses(clsx(inputs))
}
