import { Fragment, isValidElement } from 'react'
import type { ReactNode } from 'react'

export function normalizeBadgeContent(value: ReactNode): ReactNode[] {
  const nodes: ReactNode[] = []
  const append = (node: ReactNode) => {
    if (node == null || typeof node === 'boolean' || node === '') return
    if (Array.isArray(node)) node.forEach(append)
    else if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment)
      append(node.props.children)
    else if (typeof node === 'string' || typeof node === 'number') {
      const previous = nodes[nodes.length - 1]
      if (typeof previous === 'string' || typeof previous === 'number')
        nodes[nodes.length - 1] = `${previous}${node}`
      else nodes.push(node)
    } else nodes.push(node)
  }
  append(value)
  return nodes
}

export function getBadgeText(value: ReactNode): string | undefined {
  const nodes = normalizeBadgeContent(value)
  return nodes.length > 0 &&
    nodes.every((node) => typeof node === 'string' || typeof node === 'number')
    ? nodes.join('')
    : undefined
}
