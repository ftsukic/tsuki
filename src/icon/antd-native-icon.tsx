import { useToken } from '../theme'
import { useIconSize } from './context'
import { Pressable } from '../pressable'
import type { AntdNativeIconProps } from './types'
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/lib/types'
import { memo, type ReactNode } from 'react'
import type { ColorValue, PressableProps, StyleProp, ViewProps, ViewStyle } from 'react-native'
import { View } from 'react-native'
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

type NativeSvgAttributes = Record<string, string | ColorValue>
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

function resolveTwoToneColors(
  color: ColorValue,
  twoToneColor: AntdNativeIconProps['twoToneColor'],
  fallbackSecondaryColor: string,
): readonly [ColorValue, ColorValue] {
  if (twoToneColor && typeof twoToneColor !== 'string') return twoToneColor
  if (twoToneColor) return [twoToneColor, twoToneColor]
  return [color, fallbackSecondaryColor]
}

function resolveAttributes(attrs: NativeSvgAttributes, color: ColorValue): NativeSvgAttributes {
  return Object.entries(attrs).reduce<NativeSvgAttributes>((result, [key, value]) => {
    const normalizedKey = attributeAliases[key] ?? key
    result[normalizedKey] = value === 'currentColor' ? color : value
    return result
  }, {})
}

function renderNode(
  node: AbstractNode,
  key: string,
  size: number,
  primaryColor: ColorValue,
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
        <Svg
          fill={primaryColor}
          {...svgProps}
          {...attrs}
          pointerEvents="none"
          key={key}
          width={size}
          height={size}
          style={svgStyle}
        >
          {children}
        </Svg>
      )
    }
    case 'g':
      return (
        <G {...resolveAttributes(node.attrs, primaryColor)} key={key}>
          {children}
        </G>
      )
    case 'path':
      return <Path {...resolveAttributes(node.attrs, primaryColor)} key={key} />
    case 'circle':
      return <Circle {...resolveAttributes(node.attrs, primaryColor)} key={key} />
    case 'ellipse':
      return <Ellipse {...resolveAttributes(node.attrs, primaryColor)} key={key} />
    case 'line':
      return <Line {...resolveAttributes(node.attrs, primaryColor)} key={key} />
    case 'polygon':
      return <Polygon {...resolveAttributes(node.attrs, primaryColor)} key={key} />
    case 'polyline':
      return <Polyline {...resolveAttributes(node.attrs, primaryColor)} key={key} />
    case 'rect':
      return <Rect {...resolveAttributes(node.attrs, primaryColor)} key={key} />
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

function getIconNode(
  definition: IconDefinition,
  primaryColor: ColorValue,
  secondaryColor: ColorValue,
) {
  return typeof definition.icon === 'function'
    ? definition.icon(
        typeof primaryColor === 'string' ? primaryColor : 'currentColor',
        typeof secondaryColor === 'string' ? secondaryColor : 'currentColor',
      )
    : definition.icon
}

function getIconHitSlop(size: number, touchableSize: number, hitSlop: PressableProps['hitSlop']) {
  if (hitSlop !== undefined) return hitSlop
  const padding = Math.max(0, (touchableSize - size) / 2)
  return { top: padding, right: padding, bottom: padding, left: padding }
}

export function AntdNativeIcon({
  definition,
  size,
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
  const { token } = useToken()
  const contextSize = useIconSize()
  const resolvedSize = size ?? contextSize ?? 24
  const resolvedColor = color ?? token.colorIcon
  const [primaryColor, secondaryColor] = resolveTwoToneColors(
    resolvedColor,
    twoToneColor,
    token.colorFillSecondary,
  )
  const iconNode = getIconNode(definition, primaryColor, secondaryColor)
  const rootProps: ViewProps = {}
  const nativeSvgProps = { ...svgProps }
  // Accessibility belongs to the interactive root, outside the SVG touch boundary.
  for (const key of Object.keys(nativeSvgProps)) {
    if (
      key.startsWith('accessibility') ||
      key.startsWith('onAccessibility') ||
      key.startsWith('aria-') ||
      [
        'accessible',
        'importantForAccessibility',
        'screenReaderFocusable',
        'onMagicTap',
        'role',
      ].includes(key)
    ) {
      Object.assign(rootProps, { [key]: nativeSvgProps[key as keyof typeof nativeSvgProps] })
      delete nativeSvgProps[key as keyof typeof nativeSvgProps]
    }
  }
  const renderedIcon = renderNode(
    iconNode,
    definition.name,
    resolvedSize,
    primaryColor,
    svgStyle,
    nativeSvgProps,
  )
  const iconContent =
    rotation === undefined ? (
      renderedIcon
    ) : (
      <View style={{ transform: [{ rotate: `${rotation}deg` }] }}>{renderedIcon}</View>
    )
  const touchBoundary = <View pointerEvents="none">{iconContent}</View>
  const resolvedStyle = [defaultStyle, disabled && { opacity: 0.4 }, style] as StyleProp<ViewStyle>

  if (!onPress)
    return (
      <View {...rootProps} style={resolvedStyle}>
        {touchBoundary}
      </View>
    )

  return (
    <Pressable
      {...rootProps}
      disabled={disabled}
      onPress={onPress}
      hitSlop={getIconHitSlop(resolvedSize, touchableSize, hitSlop)}
      pressStyle="opacity"
      pressedOpacity={token.pressedOpacity}
      style={resolvedStyle}
    >
      {touchBoundary}
    </Pressable>
  )
}

export default memo(AntdNativeIcon)
