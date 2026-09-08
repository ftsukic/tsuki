import { forwardRef } from 'react'
import { Text as NativeText } from 'react-native'
import type { Text as NativeTextInstance } from 'react-native'
import { useToken } from '../theme'
import { getTextStyles } from './style'
import type { TextProps } from './interface'

export const Text = forwardRef<NativeTextInstance, TextProps>(function Text(
  { children, type = 'default', size = 'normal', weight, style, ...props },
  ref,
) {
  const { token } = useToken()

  return (
    <NativeText ref={ref} {...props} style={[getTextStyles(token, type, size, weight), style]}>
      {children}
    </NativeText>
  )
})

Text.displayName = 'Text'
