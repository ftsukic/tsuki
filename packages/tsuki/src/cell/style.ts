import { StyleSheet } from 'react-native'
import type { ColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native'
import { cn } from '../style/cn'
import { nativeWindVariables } from '../style/nativewind-variables'

type Defaults = ViewStyle | TextStyle
type Rule = readonly [`--tsuki-cell-${string}`, string]

const rules = {
  backgroundColor: ['--tsuki-cell-bg-value', 'bg-[color:var(--tsuki-cell-bg-value)]'],
  color: ['--tsuki-cell-color-value', 'text-[color:var(--tsuki-cell-color-value)]'],
  opacity: ['--tsuki-cell-opacity-value', 'opacity-[var(--tsuki-cell-opacity-value)]'],
  paddingHorizontal: ['--tsuki-cell-px-value', 'px-[var(--tsuki-cell-px-value)]'],
  paddingVertical: ['--tsuki-cell-py-value', 'py-[var(--tsuki-cell-py-value)]'],
  minHeight: ['--tsuki-cell-min-height-value', 'min-h-[var(--tsuki-cell-min-height-value)]'],
  gap: ['--tsuki-cell-gap-value', 'gap-[var(--tsuki-cell-gap-value)]'],
  marginLeft: ['--tsuki-cell-ml-value', 'ml-[var(--tsuki-cell-ml-value)]'],
  fontSize: ['--tsuki-cell-font-value', 'text-[length:var(--tsuki-cell-font-value)]'],
  lineHeight: ['--tsuki-cell-line-height-value', 'leading-tsuki-cell-slot'],
} satisfies Partial<Record<keyof (ViewStyle & TextStyle), Rule>>

type DynamicStyle = Partial<Record<keyof typeof rules, ColorValue | number>>

export function cellSlot<T extends Defaults>(
  base: T,
  baseClass: string,
  dynamic: DynamicStyle,
  className?: string,
  style?: StyleProp<T>,
  forceVariables = false,
) {
  const inline = StyleSheet.flatten(style)
  const paddingHorizontal = inline?.paddingHorizontal ?? inline?.padding
  const paddingVertical = inline?.paddingVertical ?? inline?.padding
  // Keep native shorthand overrides above the axis-specific Tailwind declarations.
  const edges = {
    ...(paddingHorizontal != null && {
      paddingLeft: inline?.paddingLeft ?? paddingHorizontal,
      paddingRight: inline?.paddingRight ?? paddingHorizontal,
    }),
    ...(paddingVertical != null && {
      paddingTop: inline?.paddingTop ?? paddingVertical,
      paddingBottom: inline?.paddingBottom ?? paddingVertical,
    }),
    ...(inline?.gap != null && {
      rowGap: inline.rowGap ?? inline.gap,
      columnGap: inline.columnGap ?? inline.gap,
    }),
  } as T
  if (className || forceVariables) {
    const values: Record<string, ColorValue | number> = {}
    const classes: string[] = []
    for (const key of Object.keys(dynamic) as (keyof DynamicStyle)[]) {
      const value = dynamic[key]
      if (value == null) continue
      const [variable, utility] = rules[key]
      // A unitless CSS line-height is a multiplier. Cell tokens are lengths.
      values[variable] = key === 'lineHeight' && typeof value === 'number' ? `${value}px` : value
      classes.push(utility)
    }
    const variables = nativeWindVariables(values)
    if (variables) {
      return {
        className: cn(baseClass, classes, classes.length > 0 && 'will-change-variable', className),
        style: [variables as T, style, edges],
      }
    }
  }
  return { className, style: [{ ...base, ...dynamic } as T, style, edges] }
}
