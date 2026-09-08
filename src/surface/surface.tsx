import { View } from 'react-native'
import { useToken } from '../theme'
import type { SurfaceProps } from './interface'

export function Surface({
  background,
  children,
  inset = false,
  overflow = 'hidden',
  radius,
  style,
  ...viewProps
}: SurfaceProps) {
  const token = useToken().token

  return (
    <View
      {...viewProps}
      style={[
        {
          backgroundColor: background ?? token.colorBgContainer,
          borderRadius: radius ?? token.borderRadiusLG,
          marginHorizontal: inset ? token.padding : 0,
          overflow,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

Surface.displayName = 'Surface'
