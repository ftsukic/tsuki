import type { ColorValue, ViewStyle } from 'react-native'

export function nativeWindVariables(
  variables: Record<string, ColorValue | number>,
): ViewStyle | undefined {
  let nativewind: { vars: (values: Record<string, ColorValue | number>) => ViewStyle }
  try {
    // Metro treats requires in a try block as optional dependencies.
    // eslint-disable-next-line ts/no-require-imports
    nativewind = require('nativewind')
  } catch (error) {
    if (error instanceof ReferenceError && typeof require === 'undefined') return undefined
    if (
      error instanceof Error &&
      /Cannot find module .*nativewind|Requiring unknown module/.test(error.message)
    ) {
      return undefined
    }
    throw error
  }
  return nativewind.vars(variables)
}
