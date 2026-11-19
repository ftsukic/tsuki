import { Children, Fragment, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { Text } from '../text'
import type { TextProps } from '../text'

interface FragmentProps {
  children?: ReactNode
}

export function hasContent(node: ReactNode): boolean {
  if (node == null || typeof node === 'boolean' || node === '') return false
  if (Array.isArray(node)) return node.some(hasContent)
  if (isValidElement<FragmentProps>(node) && node.type === Fragment) {
    return hasContent(node.props.children)
  }
  return true
}

export function renderCellText(node: ReactNode, props: TextProps): ReactNode {
  if (typeof node === 'string' || typeof node === 'number') return <Text {...props}>{node}</Text>
  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
        {renderCellText(child, props)}
      </Fragment>
    ))
  }
  if (isValidElement<FragmentProps>(node) && node.type === Fragment) {
    return <Fragment key={node.key}>{renderCellText(node.props.children, props)}</Fragment>
  }
  return node
}

export function flattenGroup(
  children: ReactNode,
  prefix = '',
): { child: ReactNode; key: string }[] {
  return Children.toArray(children).flatMap((child, index) => {
    const key = `${prefix}/${isValidElement(child) ? child.key : index}`
    if (isValidElement<FragmentProps>(child) && child.type === Fragment) {
      return flattenGroup(child.props.children, key)
    }
    return [{ child, key }]
  })
}
