import { useContext, useMemo } from 'react'
import { ThemeContext } from './context'
import { resolveTheme } from './resolve-theme'
import { useMotionConfig } from '../motion/useMotionConfig'
import type {
  ComponentTokenFactory,
  ComponentTokenMap,
  ComponentTokenName,
} from './types/components'
import type { TokenValue } from './types/config'

const defaultTheme = resolveTheme()

function useThemeValue() {
  const context = useContext(ThemeContext)
  const theme = context ?? defaultTheme
  const { enabled } = useMotionConfig()
  const token = useMemo(
    () =>
      enabled || theme.token.motion === false ? theme.token : { ...theme.token, motion: false },
    [enabled, theme.token],
  )
  return { context, token, componentOverrides: theme.componentOverrides }
}

export function useToken(): TokenValue {
  const { token } = useThemeValue()
  return { token }
}

export function useOptionalToken(): TokenValue | null {
  const { context, token } = useThemeValue()
  return context ? { token } : null
}

export function useComponentToken<Name extends ComponentTokenName>(
  name: Name,
  factory: ComponentTokenFactory<Name>,
): ComponentTokenMap[Name] {
  const { token, componentOverrides } = useThemeValue()
  const override = componentOverrides[name]
  return useMemo(() => ({ ...factory(token), ...override }), [factory, override, token])
}
