import { Children, Fragment, isValidElement } from 'react'
import type { ReactNode } from 'react'

export function normalizeTagContent(children: ReactNode): ReactNode[] {
  const nodes: ReactNode[] = []
  const append = (value: ReactNode) => {
    Children.forEach(value, (child) => {
      if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
        append(child.props.children)
      } else if (typeof child === 'string' || typeof child === 'number') {
        const previous = nodes[nodes.length - 1]
        if (typeof previous === 'string' || typeof previous === 'number')
          nodes[nodes.length - 1] = `${previous}${child}`
        else nodes.push(child)
      } else if (child != null) nodes.push(child)
    })
  }
  append(children)
  return nodes
}
