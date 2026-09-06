import { useOptionalToken } from '../theme'
import type { AntdNativeIconProps } from './interface'
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/lib/types'
import { memo, type ReactNode } from 'react'
import type { ColorValue, PressableProps, StyleProp, ViewStyle } from 'react-native'
import { Pressable, View } from 'react-native'
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  Mask,
  Path,
  Polygon,
  Polyline,
  Rect,
  Svg,
  Symbol,
  Use,
} from 'react-native-svg'

type NativeSvgAttributes = Record<string, string>
type NativeSvgProps = Omit<
  AntdNativeIconProps,
  | 'definition'
  | 'size'
  | 'rotation'
  | 'color'
  | 'style'
  | 'svgStyle'
  | 'onPress'
  | 'disabled'
  | 'touchableSize'
  | 'hitSlop'
  | 'twoToneColor'
>

const defaultStyle: ViewStyle = {
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
}

const attributeAliases: Record<string, string> = {
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
}

function toColorString(color: ColorValue): string {
  return typeof color === 'string' ? color : String(color)
}

function resolveTwoToneColors(
  color: string,
  twoToneColor: AntdNativeIconProps['twoToneColor'],
  fallbackSecondaryColor: string,
): readonly [string, string] {
  if (twoToneColor && typeof twoToneColor !== 'string') return twoToneColor
  if (twoToneColor) return [twoToneColor, twoToneColor]
  return [color, fallbackSecondaryColor]
}

function resolveAttributes(attrs: NativeSvgAttributes, color: string): NativeSvgAttributes {
  return Object.entries(attrs).reduce<NativeSvgAttributes>((result, [key, value]) => {
    const normalizedKey = attributeAliases[key] ?? key
    result[normalizedKey] = value === 'currentColor' ? color : value
    return result
  }, {})
}

function getNodeColor(attrs: NativeSvgAttributes, color: string): NativeSvgAttributes {
  const resolved = resolveAttributes(attrs, color)
  if (resolved.fill === undefined && resolved.stroke === undefined) {
    resolved.fill = color
  }
  return resolved
}

function renderNode(
  node: AbstractNode,
  key: string,
  size: number,
  primaryColor: string,
  svgStyle: AntdNativeIconProps['svgStyle'],
  svgProps: NativeSvgProps,
): ReactNode {
  const children = node.children?.map((child, index) =>
    renderNode(child, `${key}-${index}`, size, primaryColor, undefined, svgProps),
  )

  switch (node.tag) {
    case 'svg': {
      const attrs = resolveAttributes(node.attrs, primaryColor)
      return (
        <Svg {...svgProps} {...attrs} key={key} width={size} height={size} style={svgStyle}>
          {children}
        </Svg>
      )
    }
    case 'g':
      return (
        <G {...getNodeColor(node.attrs, primaryColor)} key={key}>
          {children}
        </G>
      )
    case 'path':
      return <Path {...getNodeColor(node.attrs, primaryColor)} key={key} />
    case 'circle':
      return <Circle {...getNodeColor(node.attrs, primaryColor)} key={key} />
    case 'ellipse':
      return <Ellipse {...getNodeColor(node.attrs, primaryColor)} key={key} />
    case 'line':
      return <Line {...getNodeColor(node.attrs, primaryColor)} key={key} />
    case 'polygon':
      return <Polygon {...getNodeColor(node.attrs, primaryColor)} key={key} />
    case 'polyline':
      return <Polyline {...getNodeColor(node.attrs, primaryColor)} key={key} />
    case 'rect':
      return <Rect {...getNodeColor(node.attrs, primaryColor)} key={key} />
    case 'defs':
      return (
        <Defs {...node.attrs} key={key}>
          {children}
        </Defs>
      )
    case 'clipPath':
      return (
        <ClipPath {...node.attrs} key={key}>
          {children}
        </ClipPath>
      )
    case 'mask':
      return (
        <Mask {...node.attrs} key={key}>
          {children}
        </Mask>
      )
    case 'symbol':
      return (
        <Symbol {...node.attrs} key={key}>
          {children}
        </Symbol>
      )
    case 'use':
      return <Use {...node.attrs} key={key} />
    default:
      return null
  }
}

function getIconNode(definition: IconDefinition, primaryColor: string, secondaryColor: string) {
  return typeof definition.icon === 'function'
    ? definition.icon(primaryColor, secondaryColor)
    : definition.icon
}

function getIconHitSlop(size: number, touchableSize: number, hitSlop: PressableProps['hitSlop']) {
  if (hitSlop !== undefined) return hitSlop
  const padding = Math.max(0, (touchableSize - size) / 2)
  return { top: padding, right: padding, bottom: padding, left: padding }
}

export function AntdNativeIcon({
  definition,
  size = 24,
  rotation,
  color,
  style,
  svgStyle,
  onPress,
  disabled = false,
  touchableSize = 44,
  hitSlop,
  twoToneColor,
  ...svgProps
}: AntdNativeIconProps) {
  const theme = useOptionalToken()
  const resolvedColor = toColorString(color ?? theme?.token.colorIcon ?? '#5A6068')
  const [primaryColor, secondaryColor] = resolveTwoToneColors(
    resolvedColor,
    twoToneColor,
    theme?.token.colorFillSecondary ?? '#E6E6E6',
  )
  const iconNode = getIconNode(definition, primaryColor, secondaryColor)
  const renderedIcon = renderNode(iconNode, definition.name, size, primaryColor, svgStyle, svgProps)
  const iconContent =
    rotation === undefined ? (
      renderedIcon
    ) : (
      <View style={{ transform: [{ rotate: `${rotation}deg` }] }}>{renderedIcon}</View>
    )
  const resolvedStyle = [defaultStyle, disabled && { opacity: 0.4 }, style] as StyleProp<ViewStyle>

  if (!onPress) {
    return <View style={resolvedStyle}>{iconContent}</View>
  }

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      hitSlop={getIconHitSlop(size, touchableSize, hitSlop)}
      style={({ pressed }) => [resolvedStyle, pressed && { opacity: 0.6 }]}
    >
      {iconContent}
    </Pressable>
  )
}

export default memo(AntdNativeIcon)
