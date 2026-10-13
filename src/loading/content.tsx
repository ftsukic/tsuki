import { Fragment, isValidElement } from 'react'
import type { ReactNode } from 'react'

/** Flatten text and fragments without inspecting custom component implementations. */
export function normalizeLoadingContent(children: ReactNode): ReactNode[] {
  const content: ReactNode[] = []
  const append = (value: ReactNode) => {
    if (value === null || value === undefined || typeof value === 'boolean' || value === '') return
    if (Array.isArray(value)) {
      value.forEach(append)
    } else if (isValidElement<{ children?: ReactNode }>(value) && value.type === Fragment) {
      append(value.props.children)
    } else if (typeof value === 'string' || typeof value === 'number') {
      const previous = content[content.length - 1]
      if (typeof previous === 'string' || typeof previous === 'number') {
        content[content.length - 1] = `${previous}${value}`
      } else content.push(value)
    } else content.push(value)
  }
  append(children)
  return content
}
