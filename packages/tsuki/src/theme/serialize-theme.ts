import type { ResolvedTheme, ThemeVariables } from './types'

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)
}

export function serializeTheme(theme: ResolvedTheme): ThemeVariables {
  const variables: Record<string, string> = {}

  for (const [token, value] of Object.entries(theme.semantic)) {
    variables[`--tsuki-${toKebabCase(token)}`] = value
  }

  for (const [component, tokens] of Object.entries(theme.components)) {
    for (const [token, value] of Object.entries(tokens)) {
      variables[`--tsuki-${component.toLowerCase()}-${toKebabCase(token)}`] =
        typeof value === 'number' && token !== 'disabledOpacity'
          ? token === 'animationDuration'
            ? `${value}ms`
            : `${value}px`
          : String(value)
    }
  }

  return variables as ThemeVariables
}
