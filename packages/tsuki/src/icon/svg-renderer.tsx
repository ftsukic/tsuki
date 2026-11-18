import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/lib/types'
import { createElement } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { ColorValue } from 'react-native'
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Mask,
  Path,
  Polygon,
  Polyline,
  RadialGradient,
  Rect,
  Stop,
  Svg,
  Symbol,
  Use,
} from 'react-native-svg'
import type { SvgProps } from 'react-native-svg'

const elements = {
  circle: Circle,
  clipPath: ClipPath,
  defs: Defs,
  ellipse: Ellipse,
  g: G,
  line: Line,
  linearGradient: LinearGradient,
  mask: Mask,
  path: Path,
  polygon: Polygon,
  polyline: Polyline,
  radialGradient: RadialGradient,
  rect: Rect,
  stop: Stop,
  svg: Svg,
  symbol: Symbol,
  use: Use,
}

const PRIMARY = '__tsuki_primary__'
const SECONDARY = '__tsuki_secondary__'

function renderNode(
  node: AbstractNode,
  key: number,
  primary: ColorValue,
  secondary: ColorValue,
  rootProps?: SvgProps,
): ReactNode {
  if (!Object.hasOwn(elements, node.tag)) return null

  const attributes: Record<string, ColorValue> = {}
  for (const [name, value] of Object.entries(node.attrs)) {
    if (name === 'focusable' || name === 'xmlns' || name.startsWith('xmlns:')) continue

    const prop =
      name === 'xlink:href'
        ? 'href'
        : name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
    attributes[prop] =
      value === 'currentColor' || value === PRIMARY
        ? primary
        : value === SECONDARY
          ? secondary
          : value
  }

  if (rootProps) {
    attributes.fill ??= primary
    attributes.color ??= primary
  }

  const Element = elements[node.tag as keyof typeof elements] as ComponentType<object>
  return createElement(
    Element,
    { ...attributes, ...rootProps, key },
    node.children?.map((child, index) => renderNode(child, index, primary, secondary)),
  )
}

export function renderIcon(
  definition: IconDefinition,
  primary: ColorValue,
  secondary: ColorValue,
  props: SvgProps,
) {
  const node =
    typeof definition.icon === 'function'
      ? definition.icon(
          typeof primary === 'string' ? primary : PRIMARY,
          typeof secondary === 'string' ? secondary : SECONDARY,
        )
      : definition.icon
  return renderNode(node, 0, primary, secondary, props)
}
