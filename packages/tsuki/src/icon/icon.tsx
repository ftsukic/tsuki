import { createElement } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTsukiTheme } from '../theme/theme'
import { getIconDefinition } from './icon-definitions'
import { renderIcon } from './svg-renderer'
import type { IconProps } from './types'

const styles = StyleSheet.create({
  root: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
})

function isTonePair(
  value: IconProps['twoToneColor'],
): value is readonly [NonNullable<IconProps['color']>, NonNullable<IconProps['color']>] {
  return Array.isArray(value)
}

export function Icon({
  name,
  className,
  style,
  svgStyle,
  size = 24,
  color,
  twoToneColor,
  rotation,
  onPress,
  disabled = false,
  touchableSize = 44,
  hitSlop,
  accessibilityRole,
  accessibilityState,
  ...viewProps
}: IconProps) {
  const { semantic } = useTsukiTheme()
  const definition = typeof name === 'string' ? getIconDefinition(name) : name
  if (!definition) return null
  const [primary, secondary] = isTonePair(twoToneColor)
    ? twoToneColor
    : [color ?? semantic.colorForeground, twoToneColor ?? semantic.colorMuted]
  const svg = renderIcon(definition, primary, secondary, {
    width: size,
    height: size,
    pointerEvents: 'none',
    accessible: false,
    style: [
      rotation === undefined ? undefined : { transform: [{ rotate: `${rotation}deg` }] },
      svgStyle,
    ],
  })
  const rootProps = { ...viewProps, className, style: [styles.root, style] }

  if (!onPress)
    return createElement(
      View,
      {
        accessible: viewProps.accessibilityLabel != null,
        ...rootProps,
        accessibilityRole,
        accessibilityState,
      },
      svg,
    )

  const inset = Math.max(0, (touchableSize - size) / 2)
  return createElement(
    Pressable,
    {
      ...rootProps,
      onPress,
      disabled,
      hitSlop: hitSlop ?? inset,
      accessibilityRole: accessibilityRole ?? 'button',
      accessibilityState: {
        ...accessibilityState,
        disabled: disabled || accessibilityState?.disabled,
      },
    },
    svg,
  )
}
