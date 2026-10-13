import type { ReactNode } from 'react'

interface FieldAccessibilityOptions {
  title?: ReactNode
  description?: ReactNode
  help?: ReactNode
  errorMessage?: ReactNode
  readOnly?: boolean
  required?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
}

function getText(value: ReactNode): string | undefined {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
}

/** Custom ReactNode titles retain caller-owned accessibility labels. */
export function getFieldAccessibility(props: FieldAccessibilityOptions) {
  const hint = [
    props.required ? '必填' : undefined,
    props.readOnly ? '只读' : undefined,
    getText(props.description),
    getText(props.help),
    getText(props.errorMessage),
  ]
    .filter(Boolean)
    .join('，')

  return {
    accessibilityLabel: props.accessibilityLabel ?? getText(props.title),
    accessibilityHint: props.accessibilityHint ?? (hint || undefined),
  }
}
