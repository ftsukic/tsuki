import { forwardRef, useContext } from 'react'
import { Text as NativeText } from 'react-native'
import type { Text as NativeTextInstance } from 'react-native'
import type { TextProps as NativeTextProps } from 'react-native'
import { twMerge } from 'tailwind-merge'
import { useToken } from '../theme'
import { TextInheritanceContext } from './context'
import { getTextStyles } from './style'
import type { TextProps } from './types'

export const Text = forwardRef<NativeTextInstance, TextProps>(function Text(
  { children, className, type, size, weight, style, ...props },
  ref,
) {
  const { token } = useToken()
  const inherited = useContext(TextInheritanceContext)
  const defaultStyle = getTextStyles(token, 'default', 'normal', undefined)
  const typeStyle = type === undefined ? undefined : getTextStyles(token, type, 'normal', undefined)
  const sizeStyle =
    size === undefined ? undefined : getTextStyles(token, 'default', size, undefined)
  const nativeProps = {
    ...props,
    className: twMerge(inherited?.className, className) || undefined,
    style: [
      defaultStyle,
      inherited?.style,
      typeStyle && { color: typeStyle.color },
      sizeStyle && { fontSize: sizeStyle.fontSize, lineHeight: sizeStyle.lineHeight },
      weight === undefined ? undefined : { fontWeight: weight },
      style,
    ],
  } as NativeTextProps & { className?: string }

  return (
    <NativeText ref={ref} {...(nativeProps as NativeTextProps)}>
      {children}
    </NativeText>
  )
})

Text.displayName = 'Text'
