import type { AppColorScheme, AppRadiusKey, ResolvedAppTheme } from '../types'

type AppCssVariables = Record<`--app-${string}`, string>

function kebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function addVariables(variables: AppCssVariables, prefix: string, value: unknown, unit = 'px') {
  if (typeof value === 'string' || typeof value === 'number') {
    variables[`--app-${prefix}`] = typeof value === 'number' ? `${value}${unit}` : value
    return
  }

  if (!value || typeof value !== 'object') return

  for (const [key, child] of Object.entries(value)) {
    addVariables(variables, `${prefix}-${kebabCase(key)}`, child, unit)
  }
}

function addColors(variables: AppCssVariables, colors: AppColorScheme) {
  addVariables(variables, 'color', colors, '')
}

export function toNativeWindVariables(theme: ResolvedAppTheme): AppCssVariables {
  const variables: AppCssVariables = {}
  const { typography, spacing, shape } = theme

  addColors(variables, theme.colors)
  addVariables(variables, 'spacing-scale', spacing.scale)
  addVariables(variables, 'spacing-layout', spacing.layout)
  addVariables(variables, 'shape-radius-scale', shape.radius.scale)

  for (const [name, key] of Object.entries(shape.radius.semantic)) {
    variables[`--app-shape-radius-${kebabCase(name)}`] =
      `${shape.radius.scale[key as AppRadiusKey]}px`
  }

  addVariables(variables, 'shape-border-width', shape.borderWidth)
  addVariables(variables, 'type-family', typography.family, '')
  addVariables(variables, 'type-size', typography.size)
  addVariables(variables, 'type-weight', typography.weight, '')
  addVariables(variables, 'type-line-height', typography.lineHeight, '')
  addVariables(variables, 'type-letter-spacing', typography.letterSpacing)

  for (const [name, style] of Object.entries(typography.styles)) {
    const role = `type-role-${kebabCase(name)}`
    variables[`--app-${role}-font-family`] = style.fontFamily ?? typography.family.base
    variables[`--app-${role}-font-size`] = `${style.fontSize}px`
    variables[`--app-${role}-line-height`] = `${style.lineHeight}px`
    variables[`--app-${role}-font-weight`] = String(style.fontWeight ?? typography.weight.regular)
    variables[`--app-${role}-letter-spacing`] = `${style.letterSpacing ?? 0}px`
  }

  return variables
}
