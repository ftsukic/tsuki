import { useToken } from '../theme'
import type { DividerProps } from './types'
import { View } from 'react-native'

export function Divider({
  accessibilityRole,
  color,
  inset = 0,
  pointerEvents,
  role,
  style,
  thickness,
  ...viewProps
}: DividerProps) {
  const { token } = useToken()

  return (
    <View
      {...viewProps}
      accessibilityRole={accessibilityRole}
      role={role ?? (accessibilityRole === undefined ? 'separator' : undefined)}
      style={[
        {
          alignSelf: 'stretch',
          backgroundColor: color ?? token.colorBorder,
          height: thickness ?? token.lineWidthHairline,
          marginHorizontal: inset,
          pointerEvents: pointerEvents ?? 'none',
        },
        style,
      ]}
    />
  )
}

Divider.displayName = 'Divider'
