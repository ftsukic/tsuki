import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const mergeTailwindClasses = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['tsuki-button', 'tsuki-input', 'tsuki-surface'],
      spacing: ['tsuki-button', 'tsuki-input', 'tsuki-divider', 'tsuki-surface'],
    },
    classGroups: { 'border-w': [{ border: ['tsuki-surface-width'] }] },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return mergeTailwindClasses(clsx(inputs))
}
