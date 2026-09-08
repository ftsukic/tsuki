import { forwardRef, useContext } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import type { StyleProp, ViewProps, ViewStyle } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { useToken } from '../theme'
import { getBottomBarStyles } from './style'

export interface BottomBarProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  safeAreaInsetBottom?: boolean
  style?: StyleProp<ViewStyle>
}

export const BottomBar = forwardRef<View, BottomBarProps>(function BottomBar(
  { children, safeAreaInsetBottom = true, style, ...viewProps },
  ref,
) {
  const { token } = useToken()
  const safeAreaInsets = useContext(SafeAreaInsetsContext)
  const bottomInset = safeAreaInsetBottom ? (safeAreaInsets?.bottom ?? 0) : 0

  return (
    <View ref={ref} {...viewProps} style={[getBottomBarStyles(token, bottomInset), style]}>
      {children}
    </View>
  )
})

BottomBar.displayName = 'BottomBar'
