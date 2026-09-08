import { useToken } from '../theme'
import type { DividerProps } from './interface'
import { View } from 'react-native'

export function Divider({
  color,
  inset = 0,
  pointerEvents,
  style,
  thickness,
  ...viewProps
}: DividerProps) {
  const { token } = useToken()

  return (
    <View
      {...viewProps}
      style={[
        {
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
