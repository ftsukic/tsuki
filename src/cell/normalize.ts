import { Fragment, isValidElement, type ReactNode } from 'react'
import type { CellProps } from './types'

export function isCellContentVisible(value: ReactNode): boolean {
  if (value === null || value === undefined || typeof value === 'boolean') return false
  if (Array.isArray(value)) return value.some(isCellContentVisible)
  if (isValidElement<{ children?: ReactNode }>(value) && value.type === Fragment) {
    return isCellContentVisible(value.props.children)
  }
  return true
}

/** Shared layout facts; content nodes and interaction stay with their owners. */
export function normalizeCellLayout(props: CellProps) {
  const hasTitle = isCellContentVisible(props.title)
  const hasDescription = isCellContentVisible(props.description)
  const hasTitleExtra = isCellContentVisible(props.titleExtra)
  const hasValue = isCellContentVisible(props.value)
  const hasValueExtra = isCellContentVisible(props.valueExtra)

  return {
    hasLeading: isCellContentVisible(props.leading),
    hasTitle,
    hasDescription,
    hasTitleExtra,
    hasValue,
    hasValueExtra,
    hasTrailing: isCellContentVisible(props.trailing),
    hasTitleArea: hasTitle || hasDescription || hasTitleExtra || props.required === true,
    hasValueArea: hasValue || hasValueExtra,
    valueAlign: props.valueAlign ?? (props.vertical ? 'left' : 'right'),
  }
}

export type CellLayoutState = ReturnType<typeof normalizeCellLayout>
